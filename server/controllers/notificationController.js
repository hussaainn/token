const Notification = require('../models/Notification');
const User = require('../models/User');


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
};