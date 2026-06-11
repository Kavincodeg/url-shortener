const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema(
  {
    urlId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Url',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    ip: {
      type: String,
      default: 'Unknown',
    },
    browser: {
      type: String,
      default: 'Unknown',
    },
    os: {
      type: String,
      default: 'Unknown',
    },
    device: {
      type: String,
      enum: ['Desktop', 'Mobile', 'Tablet', 'Unknown'],
      default: 'Unknown',
    },
    country: {
      type: String,
      default: 'Unknown',
    },
    city: {
      type: String,
      default: 'Unknown',
    },
    referrer: {
      type: String,
      default: 'Direct',
    },
  },
  { timestamps: false }
);

// Indexes for analytics queries
visitSchema.index({ urlId: 1, timestamp: -1 });
visitSchema.index({ urlId: 1, country: 1 });
visitSchema.index({ urlId: 1, device: 1 });

module.exports = mongoose.model('Visit', visitSchema);
