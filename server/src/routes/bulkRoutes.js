const express = require('express');
const { upload, bulkUpload, downloadSample } = require('../controllers/bulkController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/sample', protect, downloadSample);
router.post('/', protect, upload.single('file'), bulkUpload);

module.exports = router;
