const QRCode = require('qrcode');

const generateQRCode = async (url) => {
  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    });
    return qrDataUrl;
  } catch (error) {
    console.error('QR generation error:', error);
    return '';
  }
};

const generateQRSVG = async (url) => {
  try {
    const svgString = await QRCode.toString(url, { type: 'svg', errorCorrectionLevel: 'H' });
    return svgString;
  } catch (error) {
    console.error('QR SVG generation error:', error);
    return '';
  }
};

module.exports = { generateQRCode, generateQRSVG };
