const { nanoid } = require('nanoid');
const Url = require('../models/Url');

/**
 * Generates a unique 6-character short code that does not collide
 * with any existing shortCode or customAlias in the database.
 * @returns {Promise<string>}
 */
const generateUniqueCode = async () => {
  const MAX_RETRIES = 10;
  let code;
  let exists = true;
  let attempts = 0;
  while (exists) {
    if (attempts >= MAX_RETRIES) {
      throw new Error('Failed to generate a unique short code — please try again');
    }
    code = nanoid(6);
    exists = await Url.findOne({ $or: [{ shortCode: code }, { customAlias: code }] });
    attempts++;
  }
  return code;
};

module.exports = { generateUniqueCode };
