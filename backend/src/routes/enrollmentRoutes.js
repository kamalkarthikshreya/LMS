const express = require('express');
const router = express.Router();
const {
    enrollSubject,
    getMyEnrollments,
    updateProgress
} = require('../controllers/enrollmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Student only routes
router.post('/:subjectId', protect, authorize('STUDENT', 'ADMIN'), enrollSubject);
router.get('/me', protect, authorize('STUDENT'), getMyEnrollments);
router.put('/:subjectId/progress', protect, authorize('STUDENT'), updateProgress);

module.exports = router;
