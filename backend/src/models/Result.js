const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true }, // Cached for ranking computation
    score: { type: Number, required: true },
    percentage: { type: Number, required: true },
    answers: [{
        questionIndex: Number,
        selectedOptionIndex: Number,
        isCorrect: Boolean
    }]
}, { timestamps: true });

// Ensure student only attempts once for MVP, or allow multiple and keep latest
resultSchema.index({ studentId: 1, quizId: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);
