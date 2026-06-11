/**
 * Dynamically formats a short URL string into a clean "domain/code" display format.
 * Prevents hardcoding replacements and adapts automatically to dev or production environments.
 * @param {string} shortUrl 
 * @returns {string}
 */
export const formatShortUrl = (shortUrl) => {
  if (!shortUrl) return '';
  try {
    const parsed = new URL(shortUrl);
    return parsed.host + parsed.pathname;
  } catch {
    // Fallback if URL constructor fails (e.g. if it is already a partial path)
    return shortUrl;
  }
};
