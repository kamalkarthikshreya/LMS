const express = require('express');
const router = express.Router();
const { askContextualQuestion } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/ask', protect, askContextualQuestion);

module.exports = router;
