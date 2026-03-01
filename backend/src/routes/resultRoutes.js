const express = require('express');
const router = express.Router();
const { getMyResults } = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/me', protect, authorize('STUDENT'), getMyResults);

module.exports = router;
