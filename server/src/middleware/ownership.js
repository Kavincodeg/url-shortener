const Url = require('../models/Url');

const checkOwnership = async (req, res, next) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id, isDeleted: false });

    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found or access denied' });
    }

    req.url_doc = url;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error checking ownership' });
  }
};

module.exports = { checkOwnership };
