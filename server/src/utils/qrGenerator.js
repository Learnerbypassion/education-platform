const QRCode = require('qrcode');

/**
 * Generate a QR code as a data URL (base64 PNG).
 */
const generateQR = async (data) => {
  try {
    const qrDataUrl = await QRCode.toDataURL(data, {
      width: 200,
      margin: 2,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff',
      },
    });
    return qrDataUrl;
  } catch (error) {
    console.error('QR Code generation error:', error);
    return null;
  }
};

/**
 * Generate a QR code as a Buffer (for embedding in PDFs).
 */
const generateQRBuffer = async (data) => {
  try {
    const buffer = await QRCode.toBuffer(data, {
      width: 200,
      margin: 2,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff',
      },
    });
    return buffer;
  } catch (error) {
    console.error('QR Code buffer generation error:', error);
    return null;
  }
};

module.exports = { generateQR, generateQRBuffer };
