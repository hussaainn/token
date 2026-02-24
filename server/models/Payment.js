const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        token: { type: mongoose.Schema.Types.ObjectId, ref: 'Token', required: true },
        customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
        amount: { type: Number, required: true, min: 0 },
        discountApplied: { type: Number, default: 0 },
        finalAmount: { type: Number, required: true },
        method: { type: String, enum: ['cash', 'card', 'upi', 'loyalty'], default: 'cash' },
        status: { type: String, enum: ['pending', 'completed', 'refunded'], default: 'pending' },
        pointsEarned: { type: Number, default: 0 },
        pointsRedeemed: { type: Number, default: 0 },
        transactionId: { type: String, default: '' },
    },
    { timestamps: true }
);

paymentSchema.index({ customer: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
