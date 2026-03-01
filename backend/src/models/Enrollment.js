const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    progressPointer: {
        unit: { type: Number, default: 0 },
        chapter: { type: Number, default: 0 },
        section: { type: Number, default: 0 }
    },
    percentageCompleted: { type: Number, default: 0 }
}, { timestamps: true });

// Ensure a student can only enroll once in a specific subject
enrollmentSchema.index({ studentId: 1, subjectId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
