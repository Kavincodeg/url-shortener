const geoip = require('geoip-lite');

/**
 * Resolves geolocation information (Country, City) from an IP address
 * using local geoip-lite library (zero network overhead, no rate limits).
 * @param {string} ip 
 * @returns {Promise<{country: string, city: string}>}
 */
const getGeoInfo = async (ip) => {
  try {
    // Skip for localhost/private IPs (includes 10.x, 172.16-31.x, 192.168.x)
    if (!ip || ip === '127.0.0.1' || ip === '::1'
      || ip.startsWith('192.168.')
      || ip.startsWith('10.')
      || /^172\.(1[6-9]|2[0-9]|3[01])\./.test(ip)) {
      return { country: 'Local', city: 'Local' };
    }

    const geo = geoip.lookup(ip);
    if (geo) {
      return {
        country: geo.country || 'Unknown',
        city: geo.city || 'Unknown',
      };
    }
    return { country: 'Unknown', city: 'Unknown' };
  } catch (error) {
    console.error('Local geo lookup error:', error.message);
    return { country: 'Unknown', city: 'Unknown' };
  }
};

module.exports = { getGeoInfo };
