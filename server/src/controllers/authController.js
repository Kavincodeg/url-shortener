const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

// @desc    Register user
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan, profileImage: user.profileImage, timezone: user.timezone },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan, profileImage: user.profileImage, timezone: user.timezone },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  res.json({
    success: true,
    user: { id: req.user._id, name: req.user.name, email: req.user.email, plan: req.user.plan, profileImage: req.user.profileImage, timezone: req.user.timezone },
  });
};

// @desc    Update profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, email, timezone } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (timezone) updates.timezone = timezone;
    if (req.body.profileImage) updates.profileImage = req.body.profileImage;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });

    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan, profileImage: user.profileImage, timezone: user.timezone },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Upgrade plan to Pro
// @route   POST /api/auth/upgrade
const upgradePlan = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { plan: 'pro' }, { new: true });
    res.json({
      success: true,
      message: 'Successfully upgraded to Pro!',
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan, profileImage: user.profileImage, timezone: user.timezone },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Handle Google Callback
// @route   GET /api/auth/google/callback
const googleCallback = (req, res) => {
  const client_url = process.env.CLIENT_URL || 'http://localhost:5173';
  if (!req.user) {
    return res.redirect(`${client_url}/login?error=oauth_failed`);
  }

  try {
    const token = generateToken(req.user._id);
    const userObj = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      plan: req.user.plan,
      profileImage: req.user.profileImage,
      timezone: req.user.timezone
    };

    console.log("CLIENT_URL =", client_url);
    console.log(
      "REDIRECTING TO =",
      `${client_url}/oauth-success?token=${token}`
    );

    res.redirect(`${client_url}/oauth-success?token=${token}&user=${encodeURIComponent(JSON.stringify(userObj))}`);
  } catch (err) {
    console.error('Google OAuth callback handler error:', err.message);
    res.redirect(`${client_url}/login?error=oauth_failed`);
  }
};


// @desc    Upload avatar
// @route   POST /api/auth/upload-avatar
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    const avatarUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: avatarUrl },
      { new: true }
    );

    res.json({
      success: true,
      profileImage: avatarUrl,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        profileImage: user.profileImage,
        timezone: user.timezone,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  upgradePlan,
  googleCallback,
  uploadAvatar
};
