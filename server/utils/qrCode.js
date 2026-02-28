const QRCode = require('qrcode');
const crypto = require('crypto');

// Generate a unique QR token string
const generateQRToken = () => crypto.randomBytes(16).toString('hex');

// Generate QR code as base64 data URL
const generateQRCode = async (data) => {
    try {
        const qrDataUrl = await QRCode.toDataURL(JSON.stringify(data), {
            errorCorrectionLevel: 'H',
            margin: 2,
            color: { dark: '#1a1a2e', light: '#ffffff' },
            width: 300,
        });
        return qrDataUrl;
    } catch (err) {
        console.error('QR Generation error:', err);
        return null;
    }
};

module.exports = { generateQRToken, generateQRCode };
