const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
      trim: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customAlias: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, 'Alias can only contain lowercase letters, numbers, and hyphens'],
    },
    totalClicks: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    password: {
      type: String,
      default: null,
      select: false,
    },
    qrCode: {
      type: String,
      default: '',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Virtual for active status
urlSchema.virtual('isActive').get(function () {
  if (!this.expiresAt) return true;
  return new Date() < new Date(this.expiresAt);
});

// Virtual for effective short code (alias takes priority)
urlSchema.virtual('effectiveCode').get(function () {
  return this.customAlias || this.shortCode;
});

urlSchema.set('toJSON', { virtuals: true });
urlSchema.set('toObject', { virtuals: true });

// Index for fast redirect lookups
urlSchema.index(
  { customAlias: 1 },
  { unique: true, sparse: true, partialFilterExpression: { isDeleted: false } }
);
urlSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Url', urlSchema);
