const express = require('express');
const router = express.Router();
const { getSubjectRankings, getCollegeRankings } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/subject/:id/rankings', protect, authorize('ADMIN', 'INSTRUCTOR'), getSubjectRankings);
router.get('/college-rankings', protect, authorize('ADMIN'), getCollegeRankings);

module.exports = router;
