const Url = require('../models/Url');
const Visit = require('../models/Visit');

// @desc    Get analytics for a URL
// @route   GET /api/analytics/:id
const getAnalytics = async (req, res, next) => {
  try {
    const url = req.url_doc;
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const [
      totalVisits,
      uniqueIPs,
      lastVisit,
      deviceStats,
      browserStats,
      osStats,
      countryStats,
      referrerStats,
      dailyTrend,
    ] = await Promise.all([
      Visit.countDocuments({ urlId: url._id }),
      Visit.distinct('ip', { urlId: url._id }),
      Visit.findOne({ urlId: url._id }).sort({ timestamp: -1 }),
      Visit.aggregate([
        { $match: { urlId: url._id } },
        { $group: { _id: '$device', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Visit.aggregate([
        { $match: { urlId: url._id } },
        { $group: { _id: '$browser', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Visit.aggregate([
        { $match: { urlId: url._id } },
        { $group: { _id: '$os', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Visit.aggregate([
        { $match: { urlId: url._id } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Visit.aggregate([
        { $match: { urlId: url._id } },
        { $group: { _id: '$referrer', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Visit.aggregate([
        { $match: { urlId: url._id, timestamp: { $gte: startDate } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Bug fix: divide by the full time window (not just days with clicks) for accurate average
    const totalClicksInWindow = dailyTrend.reduce((sum, d) => sum + d.count, 0);
    const avgDailyClicks = Number(days) > 0
      ? Math.round(totalClicksInWindow / Number(days))
      : 0;

    res.json({
      success: true,
      analytics: {
        url: { ...url.toJSON(), shortUrl: `${process.env.BASE_URL}/${url.customAlias || url.shortCode}` },
        totalClicks: url.totalClicks,
        uniqueClicks: uniqueIPs.length,
        lastClick: lastVisit ? lastVisit.timestamp : null,
        avgDailyClicks,
        deviceStats: deviceStats.map((d) => ({ name: d._id || 'Unknown', value: d.count })),
        browserStats: browserStats.map((d) => ({ name: d._id || 'Unknown', value: d.count })),
        osStats: osStats.map((d) => ({ name: d._id || 'Unknown', value: d.count })),
        countryStats: countryStats.map((d) => ({ name: d._id || 'Unknown', value: d.count })),
        referrerStats: referrerStats.map((d) => ({ name: d._id || 'Direct', value: d.count })),
        dailyTrend: dailyTrend.map((d) => ({ date: d._id, clicks: d.count })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get visit history
// @route   GET /api/analytics/:id/visits
const getVisits = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, country, exportCsv } = req.query;
    const url = req.url_doc;

    const query = { urlId: url._id };
    if (country && country !== 'All') query.country = country;

    const total = await Visit.countDocuments(query);
    const visits = await Visit.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    if (exportCsv === 'true') {
      const allVisits = await Visit.find(query).sort({ timestamp: -1 });
      const csv = [
        'Time,Country,City,Device,Browser,OS,IP Address,Referrer',
        ...allVisits.map((v) =>
          `"${new Date(v.timestamp).toLocaleString()}","${v.country}","${v.city}","${v.device}","${v.browser}","${v.os}","${v.ip}","${v.referrer}"`
        ),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="visits-${url.shortCode}.csv"`);
      return res.send(csv);
    }

    res.json({
      success: true,
      visits,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Public stats (no auth)
// @route   GET /api/stats/:shortCode
const getPublicStats = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({
      $or: [{ customAlias: shortCode }, { shortCode }],
      isDeleted: false,
    });

    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found' });
    }

    const [uniqueIPs, lastVisit, countryStats, dailyTrend] = await Promise.all([
      Visit.distinct('ip', { urlId: url._id }),
      Visit.findOne({ urlId: url._id }).sort({ timestamp: -1 }),
      Visit.aggregate([
        { $match: { urlId: url._id } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      Visit.aggregate([
        { $match: { urlId: url._id, timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        shortUrl: `${process.env.BASE_URL}/${url.customAlias || url.shortCode}`,
        shortCode: url.customAlias || url.shortCode,
        createdAt: url.createdAt,
        totalClicks: url.totalClicks,
        uniqueClicks: uniqueIPs.length,
        lastClick: lastVisit ? lastVisit.timestamp : null,
        countryStats: countryStats.map((d) => ({ name: d._id || 'Unknown', value: d.count })),
        dailyTrend: dailyTrend.map((d) => ({ date: d._id, clicks: d.count })),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics, getVisits, getPublicStats };
