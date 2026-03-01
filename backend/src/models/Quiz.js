const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    questions: [{
        questionText: { type: String, required: true },
        options: {
            type: [String],
            validate: [arrayLimit, 'Options array must contain exactly 4 items']
        }, // Array of exactly 4 strings
        correctOptionIndex: { type: Number, required: true, min: 0, max: 3 }
    }],
}, { timestamps: true });

function arrayLimit(val) {
    return val.length === 4;
}

module.exports = mongoose.model('Quiz', quizSchema);
