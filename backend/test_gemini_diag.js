const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const listModels = async () => {
    try {
        console.log("Checking Gemini API Key...");
        // There isn't a direct "listModels" in the simple GenAI SDK, 
        // but we can try a basic generation to see the error detail.
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        console.log("Response:", result.response.text());
    } catch (err) {
        console.log("Error Full Details:");
        console.log(err);
    }
};

listModels();
