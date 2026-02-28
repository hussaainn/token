const mongoose = require('mongoose');

const loyaltySchema = new mongoose.Schema(
    {
        customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        totalPoints: { type: Number, default: 0 },
        lifetimeEarned: { type: Number, default: 0 },
        lifetimeRedeemed: { type: Number, default: 0 },
        tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
        history: [
            {
                type: { type: String, enum: ['earned', 'redeemed'], required: true },
                points: { type: Number, required: true },
                description: { type: String },
                token: { type: mongoose.Schema.Types.ObjectId, ref: 'Token' },
                date: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

// Auto-calculate tier based on lifetime earned
loyaltySchema.methods.updateTier = function () {
    if (this.lifetimeEarned >= 1000) this.tier = 'platinum';
    else if (this.lifetimeEarned >= 500) this.tier = 'gold';
    else if (this.lifetimeEarned >= 200) this.tier = 'silver';
    else this.tier = 'bronze';
};

module.exports = mongoose.model('Loyalty', loyaltySchema);
