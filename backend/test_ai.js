const { generateQuizFromText } = require('./src/services/aiService');
require('dotenv').config();

const testAi = async () => {
    console.log("🚀 Testing AI Quiz Generation...");
    try {
        const result = await generateQuizFromText("Physics", "Newton's laws of motion are three physical laws that, together, laid the foundation for classical mechanics. They describe the relationship between a body and the forces acting upon it, and its motion in response to those forces.");
        console.log("✅ SUCCESS:");
        console.log(JSON.stringify(result, null, 2));
    } catch (err) {
        console.error("❌ FAILED:");
        console.error(err);
    }
};

testAi();
