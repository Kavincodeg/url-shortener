const { nanoid } = require('nanoid');
const Url = require('../models/Url');

/**
 * Generates a unique 6-character short code that does not collide
 * with any existing shortCode or customAlias in the database.
 * @returns {Promise<string>}
 */
const generateUniqueCode = async () => {
  let code;
  let exists = true;
  while (exists) {
    code = nanoid(6);
    exists = await Url.findOne({ $or: [{ shortCode: code }, { customAlias: code }] });
  }
  return code;
};

module.exports = { generateUniqueCode };
