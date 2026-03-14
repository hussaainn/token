const Notification = require('../models/Notification');
const User = require('../models/User');
<<<<<<< HEAD
const Token = require('../models/Token');
const { getIO } = require('../config/socket');
=======
>>>>>>> df36bf6cc73aa31f12c1ca87b2e06d5d17eb4f1f


// ===============================
// @desc   Get my notifications
// ===============================
exports.getNotifications = async (req, res, next) => {
    try {
        const [notifications, unreadCount] = await Promise.all([
            Notification.find({ recipient: req.user._id })
                .sort({ createdAt: -1 })
                .limit(50),

            Notification.countDocuments({
                recipient: req.user._id,
                read: false
            })
        ]);

        res.json({
            success: true,
            unreadCount,
            notifications
        });

    } catch (err) {
        next(err);
    }
};



// ===============================
// @desc   Mark notification as read
// ===============================
exports.markRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            {
                _id: req.params.id,
                recipient: req.user._id
            },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        const unreadCount = await Notification.countDocuments({
            recipient: req.user._id,
            read: false
        });

        res.json({
            success: true,
            unreadCount,
            message: 'Marked as read'
        });

    } catch (err) {
        next(err);
    }
};



// ===============================
// @desc   Mark all as read
// ===============================
exports.markAllRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, read: false },
            { read: true }
        );

        res.json({
            success: true,
            unreadCount: 0,
            message: 'All notifications marked as read'
        });

    } catch (err) {
        next(err);
    }
};



// ===============================
// @desc   Save web push subscription
// ===============================
exports.subscribe = async (req, res, next) => {
    try {
        const { subscription } = req.body;

        if (!subscription || typeof subscription !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Valid subscription object required'
            });
        }

        await User.findByIdAndUpdate(
            req.user._id,
            { webPushSubscription: subscription },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Push subscription saved'
        });

    } catch (err) {
        next(err);
    }
<<<<<<< HEAD
};



// ===============================
// @desc   Admin send notification
// @route  POST /api/notifications/send
// @access Private (admin, staff)
// ===============================
exports.sendPushNotification = async (req, res, next) => {
    try {
        if (!['admin', 'staff'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        let { recipientId, message, type, tokenId } = req.body;

        console.log('Push Notification Request Body:', req.body);

        if (!recipientId && tokenId) {
            const token = await Token.findById(tokenId);
            if (token && token.customer) {
                recipientId = token.customer;
            }
        }

        if (!recipientId || !message) {
            return res.status(400).json({ success: false, message: 'Recipient and message required' });
        }

        const notificationType = type || 'general';

        const notification = await Notification.create({
            recipient: recipientId,
            title: 'Message from Salon',
            message,
            type: notificationType
        });

        const isCancellation = notificationType === 'appointment_cancelled' || message.toLowerCase().includes('cancelled');
        let cancellationSucceeded = false;

        if (isCancellation && tokenId) {
            try {
                await Token.findByIdAndUpdate(tokenId, { status: 'cancelled' });
                cancellationSucceeded = true;
                console.log(`Successfully auto-cancelled tokenId: ${tokenId}`);
            } catch (updateErr) {
                console.error('Error during token auto-cancellation:', updateErr);
                // Notification will still save and send cleanly due to try/catch decoupling
            }
        }

        // Emit via Socket.io to the exact user's room
        try {
            const io = getIO();
            io.to(`user:${recipientId}`).emit('notification:new', notification);

            if (cancellationSucceeded) {
                // If cancelled successfully, trigger global queue refresh for all admins/staff
                io.emit('queue:update', { action: 'token_cancelled', tokenId });
            }
        } catch (socketErr) {
            console.error('Failed to emit socket notification:', socketErr);
        }

        res.status(201).json({
            success: true,
            message: 'Notification sent successfully',
            notification
        });

    } catch (err) {
        next(err);
    }
=======
>>>>>>> df36bf6cc73aa31f12c1ca87b2e06d5d17eb4f1f
};