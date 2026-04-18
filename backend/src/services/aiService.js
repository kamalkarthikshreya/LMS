const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates a quiz from provided text context using Google Gemini.
 */
const generateQuizFromText = async (courseTitle, contextText, targetLang = 'en') => {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('your_gemini_api_key')) {
        throw new Error('CONFIG_ERROR: Gemini API Key is missing or using placeholder in backend/.env');
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are an expert educator. Based on the following source material for the course "${courseTitle}", generate a 5-question multiple-choice quiz.
            
            LANGUAGE REQUIREMENT:
            Translate all content (questions, options, and explanations) into ${targetLang}.
            
            Source Material:
            "${contextText.substring(0, 8000)}" 

            Return ONLY a JSON array of objects with the following structure:
            [
              {
                "question": "The question text?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctAnswer": "The exact text of the correct option",
                "explanation": "Brief explanation of why it is correct"
              }
            ]
            Important: Ensure the JSON is valid and properly formatted.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        
        // Robust JSON extraction (removes markdown code blocks if present)
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            text = jsonMatch[0];
        }

        const quizData = JSON.parse(text);
        return quizData;
    } catch (error) {
        console.error('Gemini Quiz Generation Error:', error);
        throw error;
    }
};

/**
 * Generates a descriptive question paper using Google Gemini.
 */
const generateQuestionPaper = async (courseTitle, topics, targetLang = 'en') => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('CONFIG_ERROR: Gemini API Key is missing');
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Generate a formal question paper for "${courseTitle}". 
            Topics to cover: ${topics.join(', ')}.
            Include Section A (Short answers), Section B (Long answers), and Section C (Case study/Numerical).
            
            LANGUAGE REQUIREMENT:
            Translate the entire question paper into ${targetLang}.
            
            Return the result in clear Markdown format with professional headings.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini Paper Generation Error:', error);
        throw error;
    }
};

/**
 * Generates Q&A pairs from raw PDF text using Google Gemini.
 * Restricts questions to the provided syllabus topics.
 * Falls back to local keyword extraction if no API key.
 */
const generateQAFromPdfText = async (pdfText, numQuestions = 8, syllabusTopics = [], subjectTitle = '') => {
    const trimmedText = pdfText.substring(0, 12000);

    // Build topic context string for prompts
    const topicsContext = syllabusTopics.length > 0
        ? `SYLLABUS TOPICS (restrict questions to ONLY these topics):\n${syllabusTopics.map((t, i) => `  ${i + 1}. ${t}`).join('\n')}`
        : '';

    // ── Local heuristic fallback — ALWAYS produces results ────────────────────
    const localFallback = (text, n, topics) => {
        // Clean and split into sentences (lenient: keep even short ones)
        const rawSentences = text
            .replace(/\n{2,}/g, ' ')              // collapse multi-newlines
            .replace(/([.!?])\s+/g, '$1\n')
            .split('\n')
            .map(s => s.trim())
            .filter(s => s.length > 20);           // very lenient min length

        const pairs = [];

        // Strategy 1: For each syllabus topic, find the best matching sentence
        if (topics.length > 0) {
            for (const topic of topics) {
                if (pairs.length >= n) break;
                const topicWords = topic.toLowerCase().split(/\s+/).filter(w => w.length > 2);
                // Score each sentence by how many topic words it contains
                let bestSentence = '';
                let bestScore = -1;
                for (const s of rawSentences) {
                    const lower = s.toLowerCase();
                    const score = topicWords.filter(w => lower.includes(w)).length;
                    if (score > bestScore) { bestScore = score; bestSentence = s; }
                }
                if (bestSentence) {
                    pairs.push({
                        question: `According to the document, what is explained about "${topic}"?`,
                        answer: bestSentence.length > 20
                            ? bestSentence
                            : `The document discusses ${topic} as part of the subject curriculum.`,
                    });
                } else {
                    // No match at all — still generate a generic question
                    pairs.push({
                        question: `What does the syllabus cover regarding "${topic}"?`,
                        answer: `The document addresses "${topic}" as a key topic in this subject area.`,
                    });
                }
            }
        }

        // Strategy 2: Fill remaining slots with best general sentences from PDF
        if (pairs.length < n && rawSentences.length > 0) {
            const used = new Set(pairs.map(p => p.answer));
            const extras = rawSentences
                .filter(s => !used.has(s))
                .sort((a, b) => b.length - a.length) // longer = more informative
                .slice(0, n - pairs.length);
            for (const sentence of extras) {
                const words = sentence.split(/\s+/);
                const keyIdx = Math.min(Math.floor(words.length * 0.5), words.length - 1);
                const keyword = words[keyIdx].replace(/[^a-zA-Z0-9]/g, '') || 'this concept';
                pairs.push({
                    question: `What does the document explain about "${keyword}"?`,
                    answer: sentence,
                });
            }
        }

        // Strategy 3: Absolute last resort — generate from topic list alone
        if (pairs.length === 0) {
            return topics.slice(0, n).map(topic => ({
                question: `What is "${topic}" as discussed in this subject?`,
                answer: `"${topic}" is a key concept in this subject. Refer to the document for detailed explanations and examples.`,
            }));
        }

        return pairs.slice(0, n);
    };

    const hasKey = process.env.GEMINI_API_KEY &&
        !process.env.GEMINI_API_KEY.includes('your_gemini_api_key') &&
        process.env.GEMINI_API_KEY.length > 10;

    if (!hasKey) {
        console.warn('PDF Q&A: No Gemini API key — using local heuristic fallback.');
        return localFallback(trimmedText, numQuestions, syllabusTopics);
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `
You are an expert educator preparing questions for the subject "${subjectTitle || 'the course'}".

${topicsContext}

Read the document excerpt below and generate exactly ${numQuestions} insightful question-and-answer pairs.
IMPORTANT RULES:
- Questions MUST be about topics present in the SYLLABUS TOPICS list above.
- Do NOT generate questions about topics outside the syllabus, even if the PDF contains such content.
- Each answer should be 2-4 sentences, detailed, and based directly on the document.
- If the document does not cover some syllabus topics, focus on the ones it does cover.

Document:
"""${trimmedText}"""

Return ONLY a valid JSON array (no markdown, no code fences):
[
  { "question": "...", "answer": "..." }
]
`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const match = text.match(/\[[\s\S]*\]/);
        if (!match) throw new Error('No JSON array in Gemini response');
        return JSON.parse(match[0]);
    } catch (error) {
        console.error('Gemini PDF Q&A Error — using fallback:', error.message);
        return localFallback(trimmedText, numQuestions, syllabusTopics);
    }
};

module.exports = { generateQuizFromText, generateQuestionPaper, generateQAFromPdfText };

