const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');
const Url = require('../models/Url');
const { generateUniqueCode } = require('../utils/codeGenerator');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

// @desc    Bulk upload URLs via CSV
// @route   POST /api/bulk
const bulkUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a CSV file' });
    }

    const { useCustomAliases, setExpiry, expiresAt } = req.body;

    const rows = [];
    const readable = Readable.from(req.file.buffer.toString());

    await new Promise((resolve, reject) => {
      readable
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'CSV file is empty' });
    }

    if (rows.length > 500) {
      return res.status(400).json({ success: false, message: 'Maximum 500 URLs per upload' });
    }

    const results = [];

    for (const row of rows) {
      const originalUrl = row.url || row.URL || row.originalUrl || Object.values(row)[0];
      const customAlias = useCustomAliases === 'true' ? (row.alias || row.customAlias) : undefined;

      if (!originalUrl || !originalUrl.startsWith('http')) {
        results.push({ originalUrl, status: 'error', error: 'Invalid URL' });
        continue;
      }

      try {
        const shortCode = await generateUniqueCode();
        const effectiveCode = customAlias || shortCode;
        const shortUrl = `${process.env.BASE_URL}/${effectiveCode}`;

        const url = await Url.create({
          userId: req.user._id,
          originalUrl,
          shortCode,
          customAlias: customAlias || undefined,
          expiresAt: setExpiry === 'true' && expiresAt ? new Date(expiresAt) : null,
          qrCode: '', // QR codes are generated dynamically on-demand
        });

        results.push({ originalUrl, shortUrl, shortCode: effectiveCode, status: 'success' });
      } catch (err) {
        results.push({ originalUrl, status: 'error', error: err.message });
      }
    }

    const successful = results.filter((r) => r.status === 'success').length;
    const failed = results.filter((r) => r.status === 'error').length;

    res.json({
      success: true,
      message: `Processed ${rows.length} URLs: ${successful} created, ${failed} failed`,
      results,
      summary: { total: rows.length, successful, failed },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download sample CSV
// @route   GET /api/bulk/sample
const downloadSample = (req, res) => {
  const csv = `url,alias\nhttps://google.com,my-google\nhttps://github.com,my-github\nhttps://linkedin.com,my-linkedin\nhttps://example.com,\n`;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="sample-bulk-upload.csv"');
  res.send(csv);
};

module.exports = { upload, bulkUpload, downloadSample };
