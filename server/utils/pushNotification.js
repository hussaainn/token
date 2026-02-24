const webpush = require('web-push');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { getIO } = require('../config/socket');

webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:admin@mercysalon.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

/**
 * Send push notification + save to DB + emit socket event
 */
const sendNotification = async ({ recipientId, type, title, message, tokenId = null }) => {
    try {
        // Save in-app notification
        await Notification.create({
            recipient: recipientId,
            type,
            title,
            message,
            channel: 'both',
            token: tokenId,
        });

        // Emit real-time via socket
        try {
            const io = getIO();
            io.to(`user:${recipientId}`).emit('notification:new', { type, title, message });
        } catch (_) { } // socket may not be ready

        // Send web push if subscription exists
        const user = await User.findById(recipientId).select('webPushSubscription');
        if (user && user.webPushSubscription) {
            const payload = JSON.stringify({ title, body: message, icon: '/logo.png' });
            await webpush.sendNotification(user.webPushSubscription, payload).catch((err) => {
                // Remove invalid subscriptions
                if (err.statusCode === 410) {
                    User.findByIdAndUpdate(recipientId, { webPushSubscription: null }).exec();
                }
            });
        }
    } catch (err) {
        console.error('Notification error:', err.message);
    }
};

module.exports = { sendNotification };
