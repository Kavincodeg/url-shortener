const express = require('express');
const passport = require('passport');
const { body } = require('express-validator');
const { register, login, getMe, updateProfile, changePassword, upgradePlan, googleCallback, uploadAvatar, sendOtp, verifyOtp } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { uploadAvatar: uploadAvatarMiddleware } = require('../middleware/upload');

const router = express.Router();

router.post('/register', authLimiter, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], register);

router.post('/login', authLimiter, [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], login);

// OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login?error=oauth_failed', session: false }), googleCallback);

// Email OTP Routes
router.post('/send-otp', authLimiter, sendOtp);
router.post('/verify-otp', authLimiter, verifyOtp);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.post('/upgrade', protect, upgradePlan);
router.post('/upload-avatar', protect, uploadAvatarMiddleware.single('avatar'), uploadAvatar);

module.exports = router;
