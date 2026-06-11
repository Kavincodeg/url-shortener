const express = require('express');
const { getAnalytics, getVisits, getPublicStats } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { checkOwnership } = require('../middleware/ownership');

const router = express.Router();

// Public stats (no auth)
router.get('/stats/:shortCode', getPublicStats);

// Protected analytics
router.get('/:id', protect, checkOwnership, getAnalytics);
router.get('/:id/visits', protect, checkOwnership, getVisits);

module.exports = router;
