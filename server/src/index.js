require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

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

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

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
app.get('/:shortCode', redirectLimiter, redirect);

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
