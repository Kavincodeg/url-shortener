const express = require('express');
const { body } = require('express-validator');
const { createUrl, getUrls, updateUrl, deleteUrl, checkAlias, getQRSVG, getQRPNG } = require('../controllers/urlController');
const { protect } = require('../middleware/auth');
const { checkOwnership } = require('../middleware/ownership');
const { createUrlLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/check-alias/:alias', protect, checkAlias);

router.post('/', protect, createUrlLimiter, [
  body('originalUrl').isURL({ require_protocol: true }).withMessage('Please provide a valid URL with http/https'),
  body('customAlias').optional().matches(/^[a-z0-9-]+$/i).withMessage('Alias can only contain letters, numbers, and hyphens').isLength({ max: 50 }),
], createUrl);

router.get('/', protect, getUrls);

router.put('/:id', protect, checkOwnership, [
  body('originalUrl').optional().isURL({ require_protocol: true }).withMessage('Please provide a valid URL'),
], updateUrl);

router.delete('/:id', protect, checkOwnership, deleteUrl);
router.get('/:id/qr-svg', protect, checkOwnership, getQRSVG);
router.get('/:id/qr-png', protect, checkOwnership, getQRPNG);

module.exports = router;
