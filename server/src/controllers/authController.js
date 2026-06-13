const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendOTPEmail } = require('../services/emailService');

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

// @desc    Step 1 of registration — send OTP to email
// @route   POST /api/auth/send-otp
const sendOTP = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { name, email, password } = req.body;

    // Block if email already has a verified account
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered. Please log in.' });
    }

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Hash password + OTP before storing
    const [hashedPassword, hashedOtp] = await Promise.all([
      bcrypt.hash(password, 12),
      bcrypt.hash(otp, 10),
    ]);

    // Upsert: replace any existing pending OTP for this email
    await OTP.findOneAndDelete({ email });
    await OTP.create({ email, name, hashedPassword, hashedOtp });

    // Send email
    await sendOTPEmail(email, otp, name);

    res.json({ success: true, message: `Verification code sent to ${email}` });
  } catch (error) {
    next(error);
  }
};

// @desc    Step 2 of registration — verify OTP and create account
// @route   POST /api/auth/verify-otp
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const record = await OTP.findOne({ email });
    if (!record) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found. Please request a new one.' });
    }

    // Brute-force guard
    if (record.attempts >= 5) {
      await OTP.deleteOne({ email });
      return res.status(429).json({ success: false, message: 'Too many incorrect attempts. Please register again.' });
    }

    const isMatch = await bcrypt.compare(otp, record.hashedOtp);
    if (!isMatch) {
      record.attempts += 1;
      await record.save();
      const left = 5 - record.attempts;
      return res.status(400).json({ success: false, message: `Incorrect code. ${left} attempt${left === 1 ? '' : 's'} remaining.` });
    }

    // OTP correct — create the user (password is already hashed; bypass pre-save hook)
    const user = new User({ name: record.name, email: record.email });
    user.password = record.hashedPassword; // already hashed
    // Mark password as not-modified so the pre-save hook won't double-hash
    user.$locals = user.$locals || {};
    await User.collection.insertOne({
      name: record.name,
      email: record.email,
      password: record.hashedPassword,
      plan: 'free',
      profileImage: '',
      timezone: 'UTC',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Clean up OTP record
    await OTP.deleteOne({ email });

    // Fetch the created user doc for response
    const newUser = await User.findOne({ email });
    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email, plan: newUser.plan, profileImage: newUser.profileImage, timezone: newUser.timezone },
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
  uploadAvatar,
  sendOTP,
  verifyOTP,
};
