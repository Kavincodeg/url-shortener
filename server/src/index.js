require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
require('./config/passport');

const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter, redirectLimiter } = require('./middleware/rateLimiter');
const { redirect } = require('./controllers/redirectController');

// Route imports
const authRoutes = require('./routes/authRoutes');
const urlRoutes = require('./routes/urlRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const bulkRoutes = require('./routes/bulkRoutes');

const app = express();

// Trust Render/Vercel/Heroku proxy (fixes express-rate-limit X-Forwarded-For error)
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Session and Passport middleware
app.use(
  session({
    secret: process.env.JWT_SECRET || 'linko_session_secret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// General rate limiter
app.use('/api', generalLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/bulk', bulkRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Linko API is running', timestamp: new Date().toISOString() });
});

// Redirect route (must be last before error handler)
// Bug fix: skip DB lookup for common static file requests
const STATIC_SKIP = new Set(['favicon.ico', 'robots.txt', 'sitemap.xml', 'apple-touch-icon.png']);
app.get('/:shortCode', redirectLimiter, (req, res, next) => {
  if (STATIC_SKIP.has(req.params.shortCode)) return res.status(404).send();
  return redirect(req, res, next);
});

// 404 handler for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Linko server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

module.exports = app;
