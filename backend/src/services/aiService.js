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

module.exports = { generateQuizFromText, generateQuestionPaper };
