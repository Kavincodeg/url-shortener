const mongoose = require('mongoose');

/**
 * Temporary OTP document.
 * Stores hashed OTP + hashed password for pending registrations.
 * MongoDB TTL index auto-deletes docs after 10 minutes.
 */
const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  // Hashed password (bcrypt) — stored so we can create the User on successful verify
  hashedPassword: {
    type: String,
    required: true,
  },
  // Hashed OTP (bcrypt) — never store plaintext OTPs
  hashedOtp: {
    type: String,
    required: true,
  },
  // Number of failed verify attempts (lock out after 5)
  attempts: {
    type: Number,
    default: 0,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  },
});

// MongoDB TTL index: automatically removes document after expiresAt
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', otpSchema);
