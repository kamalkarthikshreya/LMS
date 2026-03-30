const express = require('express');
const router = express.Router();
const { askContextualQuestion, translateContent, ragAsk, ragReloadDb } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/ask', protect, askContextualQuestion);
router.post('/translate', protect, translateContent);
router.post('/rag-ask', protect, ragAsk);
router.post('/rag-reload', protect, ragReloadDb);

module.exports = router;
