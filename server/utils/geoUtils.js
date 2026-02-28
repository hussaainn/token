// Haversine formula to calculate distance between two lat/lng points (in meters)
const haversineDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371000; // Earth radius in meters
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Determine arrival status based on distance and token time
const getArrivalStatus = (distanceMeters, tokenDate, tokenTimeSlot, bufferMinutes = 10) => {
    const radius = parseInt(process.env.GEO_RADIUS_METERS) || 200;
    if (distanceMeters <= radius) return 'arrived';

    // Check if they're late
    const [time, period] = tokenTimeSlot.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    const slotDate = new Date(tokenDate);
    slotDate.setHours(hours, minutes, 0, 0);
    const now = new Date();
    if (now > new Date(slotDate.getTime() + bufferMinutes * 60000)) return 'late';

    return 'on-the-way';
};

module.exports = { haversineDistance, getArrivalStatus };
