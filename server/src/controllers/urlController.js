const { validationResult } = require('express-validator');
const Url = require('../models/Url');
const { generateUniqueCode } = require('../utils/codeGenerator');

const RESERVED_KEYWORDS = new Set([
  'api', 'health', 'login', 'register', 'dashboard', 'settings',
  'profile', 'billing', 'bulk', 'oauth-success', 'links', 'analytics', 'qr-codes'
]);

// @desc    Create short URL
// @route   POST /api/urls
const createUrl = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { originalUrl, customAlias, expiresAt } = req.body;

    // Check custom alias availability
    if (customAlias) {
      const normalizedAlias = customAlias.toLowerCase();

      // Check reserved keywords
      if (RESERVED_KEYWORDS.has(normalizedAlias)) {
        return res.status(400).json({ success: false, message: 'This alias is a reserved system keyword' });
      }

      // Check collision with custom aliases and short codes
      const collision = await Url.findOne({
        $or: [{ customAlias: normalizedAlias }, { shortCode: normalizedAlias }],
        isDeleted: false,
      });
      if (collision) {
        return res.status(400).json({ success: false, message: 'Custom alias already taken' });
      }
    }

    const shortCode = await generateUniqueCode();
    const effectiveCode = customAlias ? customAlias.toLowerCase() : shortCode;
    const shortUrl = `${process.env.BASE_URL}/${effectiveCode}`;

    const url = await Url.create({
      userId: req.user._id,
      originalUrl,
      shortCode,
      customAlias: customAlias ? customAlias.toLowerCase() : undefined,
      expiresAt: expiresAt || null,
      qrCode: '', // QR codes are generated dynamically on-demand
    });

    res.status(201).json({
      success: true,
      url: {
        ...url.toJSON(),
        shortUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all URLs for user
// @route   GET /api/urls
const getUrls = async (req, res, next) => {
  try {
    const { search, filter, page = 1, limit = 10 } = req.query;
    const query = { userId: req.user._id, isDeleted: false };

    if (search) {
      query.$or = [
        { originalUrl: { $regex: search, $options: 'i' } },
        { shortCode: { $regex: search, $options: 'i' } },
        { customAlias: { $regex: search, $options: 'i' } },
      ];
    }

    const now = new Date();
    if (filter === 'active') {
      query.$or = [{ expiresAt: null }, { expiresAt: { $gt: now } }];
    } else if (filter === 'expired') {
      query.expiresAt = { $lte: now };
    }

    const total = await Url.countDocuments(query);
    const urls = await Url.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const enriched = urls.map((u) => ({
      ...u.toJSON(),
      shortUrl: `${process.env.BASE_URL}/${u.customAlias || u.shortCode}`,
    }));

    res.json({
      success: true,
      urls: enriched,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update URL
// @route   PUT /api/urls/:id
const updateUrl = async (req, res, next) => {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;
    const url = req.url_doc;

    if (customAlias && customAlias !== url.customAlias) {
      const normalizedAlias = customAlias.toLowerCase();

      // Check reserved keywords
      if (RESERVED_KEYWORDS.has(normalizedAlias)) {
        return res.status(400).json({ success: false, message: 'This alias is a reserved system keyword' });
      }

      const collision = await Url.findOne({
        $or: [{ customAlias: normalizedAlias }, { shortCode: normalizedAlias }],
        isDeleted: false,
        _id: { $ne: url._id },
      });
      if (collision) {
        return res.status(400).json({ success: false, message: 'Custom alias already taken' });
      }
    }

    const updates = {};
    if (originalUrl) updates.originalUrl = originalUrl;
    if (customAlias !== undefined) updates.customAlias = customAlias ? customAlias.toLowerCase() : undefined;
    if (expiresAt !== undefined) updates.expiresAt = expiresAt || null;

    const updated = await Url.findByIdAndUpdate(url._id, updates, { new: true, runValidators: true });

    res.json({
      success: true,
      url: { ...updated.toJSON(), shortUrl: `${process.env.BASE_URL}/${updated.customAlias || updated.shortCode}` },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete URL (soft delete)
// @route   DELETE /api/urls/:id
const deleteUrl = async (req, res, next) => {
  try {
    await Url.findByIdAndUpdate(req.url_doc._id, { isDeleted: true });
    res.json({ success: true, message: 'URL deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Check alias availability
// @route   GET /api/urls/check-alias/:alias
const checkAlias = async (req, res, next) => {
  try {
    const { alias } = req.params;
    const normalizedAlias = alias.toLowerCase();

    if (RESERVED_KEYWORDS.has(normalizedAlias)) {
      return res.json({ success: true, available: false });
    }

    const exists = await Url.findOne({
      $or: [{ customAlias: normalizedAlias }, { shortCode: normalizedAlias }],
      isDeleted: false,
    });
    res.json({ success: true, available: !exists });
  } catch (error) {
    next(error);
  }
};

// @desc    Get QR code SVG for a URL
// @route   GET /api/urls/:id/qr-svg
const getQRSVG = async (req, res, next) => {
  try {
    const { generateQRSVG } = require('../services/qrService');
    const url = req.url_doc;
    const shortUrl = `${process.env.BASE_URL}/${url.customAlias || url.shortCode}`;
    const svg = await generateQRSVG(shortUrl);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (error) {
    next(error);
  }
};

// @desc    Get QR code PNG for a URL
// @route   GET /api/urls/:id/qr-png
const getQRPNG = async (req, res, next) => {
  try {
    const { generateQRCode } = require('../services/qrService');
    const url = req.url_doc;
    const shortUrl = `${process.env.BASE_URL}/${url.customAlias || url.shortCode}`;
    const qrDataUrl = await generateQRCode(shortUrl);
    
    if (!qrDataUrl) {
      return res.status(500).json({ success: false, message: 'Failed to generate QR code' });
    }

    const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
    const img = Buffer.from(base64Data, 'base64');
    
    res.setHeader('Content-Type', 'image/png');
    res.send(img);
  } catch (error) {
    next(error);
  }
};

module.exports = { createUrl, getUrls, updateUrl, deleteUrl, checkAlias, getQRSVG, getQRPNG };
