const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        type: {
            type: String,
            enum: ['token_generated', 'two_remaining', 'your_turn', 'completed', 'promotion', 'general', 'appointment_cancelled', 'turn_approaching', 'turn_skipped', 'appointment_confirmed', 'custom'],
            default: 'general',
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        read: { type: Boolean, default: false },
        channel: { type: String, enum: ['push', 'in-app', 'both'], default: 'both' },
        token: { type: mongoose.Schema.Types.ObjectId, ref: 'Token', default: null },
    },
    { timestamps: true }
);

notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
