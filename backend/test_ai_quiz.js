const { Subject, Quiz, User } = require('./src/models');
const { generateAiQuiz } = require('./src/controllers/quizAiController');
require('dotenv').config();

const mockRes = {
    status: (code) => ({
        json: (data) => console.log(`[HTTP ${code}]`, JSON.stringify(data, null, 2))
    })
};

const mockReq = {
    params: { subjectId: 2 },
    user: { id: 1 },
    body: {}
};

const test = async () => {
    console.log("🚀 Running AI Quiz Fallback Test...");
    try {
        await generateAiQuiz(mockReq, mockRes);
    } catch (err) {
        console.error("❌ CRITICAL ERROR:");
        console.error(err);
    }
};

test();
