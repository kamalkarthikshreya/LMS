const { Subject, Quiz } = require('../models');
const { generateQuizFromText, generateQuestionPaper } = require('../services/aiService');

/**
 * @desc    Generate a quiz using AI based on course content
 * @route   POST /api/quizzes/generate/:subjectId
 * @access  Private/Instructor
 */
const generateAiQuiz = async (req, res) => {
    let subject, context;
    try {
        const { subjectId } = req.params;
        const { targetLang } = req.body;
        subject = await Subject.findByPk(subjectId);

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Logic to extract context from subject units with robust null checks
        context = (subject.units || []).map(u => 
            (u.chapters || []).map(c => 
                (c.sections || []).map(s => (s.paragraphs || []).join(' ')).join(' ')
            ).join(' ')
        ).join(' ');

        if (!context || context.length < 10) {
            return res.status(400).json({ message: 'Insufficient course content (minimum 10 characters) to generate a quiz' });
        }

        console.log(`🤖 Generating Assessment for: ${subject.title} (Lang: ${targetLang || 'en'})`);
        
        let aiQuestions;
        // Check for common placeholders or empty keys
        const hasKey = process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('AIzaSy');

        if (hasKey) {
            try {
                aiQuestions = await generateQuizFromText(subject.title, context, targetLang || 'en');
            } catch (aiError) {
                console.warn('AI Service failed, falling back to local analysis:', aiError.message);
                throw aiError; // Trigger the catch block below for local fallback
            }
        } else {
            console.log('No API Key detected. Using Local Heuristic Analysis.');
            throw new Error('OFFLINE_MODE');
        }

        // Transform AI output to match our Quiz model (correctOptionIndex)
        const formattedQuestions = aiQuestions.map(q => {
            const correctIndex = q.options.indexOf(q.correctAnswer);
            return {
                questionText: q.question,
                options: q.options,
                correctOptionIndex: correctIndex !== -1 ? correctIndex : 0,
                explanation: q.explanation || ''
            };
        });

        const quiz = await Quiz.create({
            subjectId,
            title: `AI Generated: ${subject.title} Quiz`,
            createdBy: req.user.id,
            questions: formattedQuestions
        });

        res.status(201).json({
            message: 'Quiz generated successfully',
            quiz
        });

    } catch (error) {
        console.error('AI Controller Quiz Error:', error.message);
        
        // 🧠 LOCAL-ONLY FALLBACK: If API fails, use heuristic analysis (No API required)
        if (subject && context) {
            try {
                const mockQuestions = generateLocalQuiz(subject.title, context);
                if (mockQuestions && mockQuestions.length >= 1) {
                    const quiz = await Quiz.create({
                        subjectId: subject.id,
                        title: `[Local Analysis] ${subject.title} Quiz`,
                        createdBy: req.user.id,
                        questions: mockQuestions
                    });

                    return res.status(201).json({
                        message: 'Generated quiz using Local Analysis (No API used)',
                        quiz
                    });
                }
            } catch (fallbackError) {
                console.error('Fallback Quiz Logic Failed:', fallbackError.message);
                return res.status(500).json({ message: `Critical Fallback Error: ${fallbackError.message}` });
            }
        }

        res.status(500).json({ message: `AI Service Error: ${error.message || 'Unknown Error'}` });
    }
};

/**
 * Robust Local Quiz Generator (Heuristic-based, no API required)
 * UPDATED: Now generates up to 10 questions even from small context
 */
const generateLocalQuiz = (subjectTitle, context) => {
    // 1. Clean and split context into meaningful segments (sentences or phrases)
    const segments = context.split(/[.!?\n]/)
        .map(s => s.trim())
        .filter(s => s.length > 5); 

    if (segments.length < 1) return null;

    // 2. Identify "Key Terms" from the text
    const allWords = context.toLowerCase().match(/\b(\w+)\b/g) || [];
    const keywords = [...new Set(allWords.filter(w => w && w.length > 5))]
        .sort((a, b) => b.length - a.length);

    const questions = [];
    let currentSegmentIdx = 0;

    // 3. Generate questions until we reach 10 or run out of keywords
    while (questions.length < 10 && (currentSegmentIdx < segments.length || questions.length < keywords.length)) {
        const sentence = segments[currentSegmentIdx % segments.length];
        const words = sentence.split(/\s+/).filter(w => w.length > 0);
        
        if (words.length < 3) {
            currentSegmentIdx++;
            if (currentSegmentIdx >= segments.length && questions.length > 0) break;
            continue;
        }

        // Try to find a new keyword for this question
        const usedKeywords = questions.map(q => q.targetWord);
        let targetWord = words.find(w => w.length > 6 && !usedKeywords.includes(w.toLowerCase()));
        if (!targetWord) targetWord = keywords.find(kw => !usedKeywords.includes(kw)) || words[Math.floor(words.length/2)];

        if (!targetWord) {
            currentSegmentIdx++;
            continue;
        }

        const correctAnswer = targetWord.replace(/[^a-zA-Z]/g, '');
        // Create a variation of the sentence for variety
        const hiddenSentence = sentence.replace(new RegExp(`\\b${targetWord}\\b`, 'i'), '_______');

        // Generate distractors
        const distractors = keywords
            .filter(kw => kw && kw.toLowerCase() !== correctAnswer.toLowerCase())
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
        
        const options = [...new Set([correctAnswer, ...distractors, "Theory", "Application"])]
            .slice(0, 4)
            .sort(() => 0.5 - Math.random());
            
        const correctIndex = options.indexOf(correctAnswer);

        questions.push({
            questionText: `[Q${questions.length + 1}] Complete the core concept from ${subjectTitle}: "${hiddenSentence}"`,
            targetWord: correctAnswer.toLowerCase(), // bookkeeping
            options: options,
            correctOptionIndex: correctIndex !== -1 ? correctIndex : 0,
            explanation: `This is a fundamental concept in ${subjectTitle} curriculum.`
        });

        // Rotate segments if we have few sentences
        if (questions.length % segments.length === 0) currentSegmentIdx++;
        else currentSegmentIdx++;
    }

    return questions.map(({targetWord, ...q}) => q);
};

/**
 * @desc    Generate a question paper using AI or Local Fallback
 * @route   POST /api/quizzes/generate-paper/:subjectId
 */
const generateAiPaper = async (req, res) => {
    let subject, context;
    try {
        const { subjectId } = req.params;
        const { targetLang } = req.body;
        subject = await Subject.findByPk(subjectId);
        if (!subject) return res.status(404).json({ message: 'Subject not found' });

        const topics = (subject.units || []).map(u => u.title);
        context = (subject.units || []).map(u => 
            (u.chapters || []).map(c => 
                (c.sections || []).map(s => (s.paragraphs || []).join(' ')).join(' ')
            ).join(' ')
        ).join(' ');

        let paperContent;
        const hasKey = process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('AIzaSy');

        try {
            if (!hasKey) throw new Error('OFFLINE_MODE');
            paperContent = await generateQuestionPaper(subject.title, topics, targetLang || 'en');
        } catch (aiErr) {
            console.warn('AI Paper failed or disabled, using local extraction:', aiErr.message);
            // High-fidelity Local Template Fallback
            paperContent = `
                # Final Examination: ${subject.title}
                **Language**: ${targetLang || 'English'} (Local Mode)
                
                ## Section A: Conceptual Foundations
                1. Define the core principles of ${topics[0] || 'the subject'}. (5 Marks)
                2. Explain the relationship between ${topics[1] || 'Module 1'} and its real-world applications. (5 Marks)
                3. Briefly describe the historical development of ${subject.title}. (5 Marks)
                
                ## Section B: Analytical Problems
                4. Analyze a case study involving ${topics[Math.floor(topics.length/2)] || 'the core module'}. (10 Marks)
                5. Discuss the impact of modern technology on ${subject.title}. (10 Marks)
                
                ## Section C: Comprehensive Essay
                6. Write a detailed essay on the future trends of ${subject.title}. (20 Marks)
            `;
        }
        res.json({
            title: `${subject.title} - Question Paper`,
            content: paperContent
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { generateAiQuiz, generateAiPaper, generateLocalQuiz };
