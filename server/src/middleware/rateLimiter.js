const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: 'Too many requests from this IP, please try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const createUrlLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: { success: false, message: 'URL creation limit reached, please try again in an hour' },
  standardHeaders: true,
  legacyHeaders: false,
});

const redirectLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000,
  message: { success: false, message: 'Too many redirect requests' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development',
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, createUrlLimiter, redirectLimiter, generalLimiter };
