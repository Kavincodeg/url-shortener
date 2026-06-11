const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, updateProfile, changePassword, upgradePlan, googleLogin, googleCallback, githubLogin, githubCallback, uploadAvatar } = require('../controllers/authController');
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
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);
router.get('/github', githubLogin);
router.get('/github/callback', githubCallback);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.post('/upgrade', protect, upgradePlan);
router.post('/upload-avatar', protect, uploadAvatarMiddleware.single('avatar'), uploadAvatar);

module.exports = router;
