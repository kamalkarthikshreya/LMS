const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    thumbnail: { type: String, default: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    units: [{
        unitNumber: Number,
        title: String,
        chapters: [{
            chapterNumber: Number,
            title: String,
            sections: [{
                sectionNumber: Number,
                title: String,
                videoUrl: String,
                paragraphs: [String] // Array of text content; can contain LaTeX or SPICE netlists
            }]
        }]
    }]
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
