const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, logoutUser, verifyEmail, impersonateRole } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-email', verifyEmail);
router.get('/me', protect, getMe);
router.post('/logout', protect, logoutUser);
router.post('/impersonate', protect, authorize('IT_ADMIN'), impersonateRole);

module.exports = router;
