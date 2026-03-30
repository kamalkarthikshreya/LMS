const express = require('express');
const router = express.Router();
const {
    createGlitch,
    getGlitches,
    getGlitchById,
    updateGlitchStatus,
    deleteGlitch
} = require('../controllers/glitchController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, createGlitch);
router.get('/', protect, getGlitches);
router.get('/:id', protect, getGlitchById);
router.put('/:id/status', protect, authorize('ADMIN', 'IT_ADMIN'), updateGlitchStatus);
router.delete('/:id', protect, authorize('ADMIN', 'IT_ADMIN'), deleteGlitch);

module.exports = router;
