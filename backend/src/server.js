const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const quizRoutes = require('./routes/quizRoutes');
const resultRoutes = require('./routes/resultRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
    res.send('LMS API is running...');
});

// Public Stats Route — used by login page
app.get('/api/stats', async (req, res) => {
    try {
        const User = require('./models/User');
        const Subject = require('./models/Subject');
        const Quiz = require('./models/Quiz');
        const [students, instructors, subjects, quizzes] = await Promise.all([
            User.countDocuments({ role: 'STUDENT', status: 'ACTIVE' }),
            User.countDocuments({ role: 'INSTRUCTOR' }),
            Subject.countDocuments({}),
            Quiz.countDocuments({})
        ]);
        res.json({ students, instructors, subjects, quizzes });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
