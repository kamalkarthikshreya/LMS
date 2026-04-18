const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse'); // v1.1.1 CJS — exports a plain function
const { generateQAFromPdfText } = require('../services/aiService');

/**
 * @desc    Extract text from an uploaded PDF and generate AI Q&A pairs
 * @route   POST /api/upload/analyze-pdf
 * @access  Private
 *
 * Body: { pdfUrl: "/uploads/document-xxxxx.pdf", numQuestions: 8 }
 */
const analyzePdf = async (req, res) => {
    try {
        const { pdfUrl, numQuestions = 8, syllabusTopics = [], subjectTitle = '' } = req.body;

        if (!pdfUrl) {
            return res.status(400).json({ message: 'pdfUrl is required.' });
        }

        const isVercel = !!process.env.VERCEL;
        const uploadsDir = isVercel
            ? path.join('/tmp', 'uploads')
            : path.join(__dirname, '..', '..', 'public', 'uploads');

        const filename = path.basename(pdfUrl);
        const filePath = path.join(uploadsDir, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: `PDF file not found on server: ${filename}` });
        }

        const dataBuffer = fs.readFileSync(filePath);

        let extractedText = '';
        try {
            const pdfData = await pdfParse(dataBuffer);
            extractedText = pdfData.text || '';
        } catch (parseErr) {
            console.error('pdf-parse error:', parseErr.message);
            return res.status(500).json({ message: `PDF parsing failed: ${parseErr.message}` });
        }

        if (!extractedText || extractedText.trim().length < 50) {
            return res.status(422).json({
                message: 'Could not extract enough text from this PDF. The file may be scanned or image-based.'
            });
        }

        const qaList = await generateQAFromPdfText(extractedText, Math.min(Number(numQuestions) || 8, 20), syllabusTopics, subjectTitle);

        return res.json({
            message: 'Q&A generated successfully',
            qaList,
        });
    } catch (error) {
        console.error('PDF Analyze Error:', error);
        return res.status(500).json({ message: `Failed to analyze PDF: ${error.message}` });
    }
};

module.exports = { analyzePdf };

