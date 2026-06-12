const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  code: {
    type: String,
    required: true, // stored as bcrypt hash
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  },
  used: {
    type: Boolean,
    default: false,
  },
});

// TTL index — MongoDB auto-deletes expired docs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Hash the plain code before saving
otpSchema.pre('save', async function () {
  if (!this.isModified('code')) return;
  const salt = await bcrypt.genSalt(10);
  this.code = await bcrypt.hash(this.code, salt);
});

// Verify a plain code against the stored hash
otpSchema.methods.verifyCode = async function (plainCode) {
  return bcrypt.compare(plainCode, this.code);
};

module.exports = mongoose.model('Otp', otpSchema);
