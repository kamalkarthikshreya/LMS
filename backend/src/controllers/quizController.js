const Quiz = require('../models/Quiz');
const Result = require('../models/Result');

// @desc    Create a quiz
// @route   POST /api/quizzes
// @access  Private/Instructor
const createQuiz = async (req, res) => {
    try {
        const { subjectId, title, questions } = req.body;

        // Server-side validation
        if (!questions || questions.length !== 5) {
            return res.status(400).json({ message: 'A quiz must contain exactly 5 questions for MVP constraints' });
        }

        const quiz = await Quiz.create({
            subjectId,
            createdBy: req.user.id,
            title,
            questions
        });

        res.status(201).json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get quizzes for a specific subject
// @route   GET /api/quizzes/subject/:subjectId
// @access  Private
const getSubjectQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ subjectId: req.params.subjectId }).select('-questions.correctOptionIndex');
        // ^ Exclude correctOptionIndex so students don't cheat via network tab
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit answers and auto-grade
// @route   POST /api/quizzes/:id/submit
// @access  Private/Student
const submitQuizUrl = async (req, res) => {
    try {
        const { answers } = req.body; // Array of selected indices, e.g., [0, 2, 1, 3, 0]
        const quizId = req.params.id;
        const studentId = req.user.id;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        // Check if already attempted
        const existingResult = await Result.findOne({ studentId, quizId });
        if (existingResult) {
            return res.status(400).json({ message: 'You have already attempted this quiz' });
        }

        let score = 0;
        const gradedAnswers = [];

        quiz.questions.forEach((q, idx) => {
            const selectedOptionIndex = answers[idx];
            const isCorrect = selectedOptionIndex === q.correctOptionIndex;
            if (isCorrect) score += 1;

            gradedAnswers.push({
                questionIndex: idx,
                selectedOptionIndex,
                isCorrect
            });
        });

        const percentage = (score / quiz.questions.length) * 100;

        const result = await Result.create({
            studentId,
            quizId,
            subjectId: quiz.subjectId,
            score,
            percentage,
            answers: gradedAnswers
        });

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my quiz results
// @route   GET /api/results/me
// @access  Private/Student
const getMyResults = async (req, res) => {
    try {
        const results = await Result.find({ studentId: req.user.id })
            .populate('quizId', 'title')
            .populate('subjectId', 'title');
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createQuiz,
    getSubjectQuizzes,
    submitQuizUrl,
    getMyResults
};
