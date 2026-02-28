const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
    {
        tokenNumber: { type: String, required: true, unique: true },
        customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
        staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        date: { type: Date, required: true },
        timeSlot: { type: String, required: true }, // e.g. "10:00 AM"
        status: {
            type: String,
            enum: ['waiting', 'arrived', 'serving', 'completed', 'cancelled', 'no-show'],
            default: 'waiting',
        },
        arrivalStatus: {
            type: String,
            enum: ['pending', 'on-the-way', 'arrived', 'late', 'unknown'],
            default: 'unknown',
        },
        qrCode: { type: String, default: '' }, // base64 QR image
        qrToken: { type: String, default: '' }, // unique short string for QR
        position: { type: Number, default: 0 },
        estimatedWaitTime: { type: Number, default: 0 }, // minutes
        notes: { type: String, default: '' },
        checkedInAt: { type: Date, default: null },
        startedAt: { type: Date, default: null },
        completedAt: { type: Date, default: null },
        rescheduledFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Token', default: null },
        notificationsSent: {
            generated: { type: Boolean, default: false },
            twoRemaining: { type: Boolean, default: false },
            yourTurn: { type: Boolean, default: false },
            completed: { type: Boolean, default: false },
        },
    },
    { timestamps: true }
);

tokenSchema.index({ customer: 1, date: 1 });
tokenSchema.index({ status: 1, date: 1 });
tokenSchema.index({ staff: 1, date: 1 });
tokenSchema.index({ qrToken: 1 });

module.exports = mongoose.model('Token', tokenSchema);
