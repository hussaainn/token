const Token = require('../models/Token');
const { haversineDistance, getArrivalStatus } = require('../utils/geoUtils');
const { getIO } = require('../config/socket');

// @desc   Update geo location
// @route  POST /api/geo/update
// @access Private (customer)
exports.updateLocation = async (req, res, next) => {
    try {
        const { tokenId, lat, lng } = req.body;

        if (!lat || !lng || !tokenId)
            return res.status(400).json({ success: false, message: 'lat, lng, and tokenId required' });

        const token = await Token.findById(tokenId);
        if (!token) return res.status(404).json({ success: false, message: 'Token not found' });
        if (token.customer.toString() !== req.user._id.toString())
            return res.status(403).json({ success: false, message: 'Not your token' });

        const salonLat = parseFloat(process.env.SALON_LAT);
        const salonLng = parseFloat(process.env.SALON_LNG);
        const distance = haversineDistance(lat, lng, salonLat, salonLng);
        const arrivalStatus = getArrivalStatus(distance, token.date, token.timeSlot);

        token.arrivalStatus = arrivalStatus;
        if (arrivalStatus === 'arrived' && !token.checkedInAt) token.checkedInAt = new Date();
        await token.save();

        // Broadcast to admin
        try {
            const io = getIO();
            io.to('admin:room').emit('geo:arrival', {
                tokenId, tokenNumber: token.tokenNumber,
                arrivalStatus, distance: Math.round(distance),
                lat, lng,
            });
        } catch (_) { }

        res.json({
            success: true,
            arrivalStatus,
            distance: Math.round(distance),
            withinRadius: distance <= parseInt(process.env.GEO_RADIUS_METERS || 200),
        });
    } catch (err) {
        next(err);
    }
};

// @desc   Get salon location
// @route  GET /api/geo/salon
// @access Public
exports.getSalonLocation = async (req, res) => {
    res.json({
        success: true,
        salon: {
            name: process.env.SALON_NAME || 'Mercy Salon',
            lat: parseFloat(process.env.SALON_LAT),
            lng: parseFloat(process.env.SALON_LNG),
            radiusMeters: parseInt(process.env.GEO_RADIUS_METERS || 200),
        },
    });
};
