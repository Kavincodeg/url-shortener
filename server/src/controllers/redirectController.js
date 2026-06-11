const UAParser = require('ua-parser-js');
const Url = require('../models/Url');
const Visit = require('../models/Visit');
const { getGeoInfo } = require('../services/geoService');

// @desc    Redirect short URL and track visit
// @route   GET /:shortCode
const redirect = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    // Find by alias first, then by shortCode
    const url = await Url.findOne({
      $or: [{ customAlias: shortCode }, { shortCode }],
      isDeleted: false,
    });

    if (!url) {
      return res.status(404).json({ success: false, message: 'Short URL not found' });
    }

    // Check expiry
    if (url.expiresAt && new Date() > new Date(url.expiresAt)) {
      return res.status(410).json({ success: false, message: 'This link has expired', expiresAt: url.expiresAt });
    }

    // Increment click count asynchronously
    Url.findByIdAndUpdate(url._id, { $inc: { totalClicks: 1 } }).exec();

    // Record visit asynchronously (don't wait)
    recordVisit(url._id, req).catch(console.error);

    // Redirect
    res.redirect(302, url.originalUrl);
  } catch (error) {
    next(error);
  }
};

const recordVisit = async (urlId, req) => {
  try {
    const parser = new UAParser(req.headers['user-agent']);
    const ua = parser.getResult();

    const browser = ua.browser.name || 'Unknown';
    const os = ua.os.name || 'Unknown';
    let device = 'Desktop';
    if (ua.device.type === 'mobile') device = 'Mobile';
    else if (ua.device.type === 'tablet') device = 'Tablet';

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'Unknown';

    const referrer = req.headers.referer || req.headers.referrer || 'Direct';
    const referrerDomain = referrer !== 'Direct' ? new URL(referrer).hostname : 'Direct';

    const geo = await getGeoInfo(ip);

    await Visit.create({
      urlId,
      ip,
      browser,
      os,
      device,
      country: geo.country,
      city: geo.city,
      referrer: referrerDomain,
    });
  } catch (error) {
    console.error('Visit recording error:', error.message);
  }
};

module.exports = { redirect };
