const Loyalty = require('../models/Loyalty');
const User = require('../models/User');

const TIER_THRESHOLDS = { bronze: 0, silver: 200, gold: 500, platinum: 1000 };

const getTier = (points) => {
    if (points >= 1000) return 'platinum';
    if (points >= 500) return 'gold';
    if (points >= 200) return 'silver';
    return 'bronze';
};

// GET /api/loyalty/me — get current customer loyalty status
exports.getMyLoyalty = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('name loyaltyPoints loyaltyTier');
        const points = user.loyaltyPoints || 0;
        const tier = getTier(points);
        const tiers = ['bronze', 'silver', 'gold', 'platinum'];
        const thresholds = [0, 200, 500, 1000];
        const currentIdx = tiers.indexOf(tier);
        const nextTier = tiers[currentIdx + 1] || null;
        const nextThreshold = thresholds[currentIdx + 1] || null;
        const progressToNext = nextThreshold
            ? Math.min(((points - thresholds[currentIdx]) / (nextThreshold - thresholds[currentIdx])) * 100, 100)
            : 100;

        const discountMap = { bronze: 0, silver: 10, gold: 20, platinum: 30 };
        const redeemablePoints = Math.floor(points / 100) * 100;
        const redeemableValue = redeemablePoints * 0.1;

        res.json({
            success: true,
            points,
            tier,
            nextTier,
            nextThreshold,
            progressToNext: Math.round(progressToNext),
            discountPercent: discountMap[tier],
            redeemablePoints,
            redeemableValue,
            pointsToNextTier: nextThreshold ? nextThreshold - points : 0,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/loyalty/redeem — redeem points for discount code
exports.redeemPoints = async (req, res) => {
    try {
        const { pointsToRedeem } = req.body;
        if (!pointsToRedeem || pointsToRedeem % 100 !== 0) {
            return res.status(400).json({ success: false, message: 'Redeem in multiples of 100 points' });
        }
        const user = await User.findById(req.user._id);
        if (user.loyaltyPoints < pointsToRedeem) {
            return res.status(400).json({ success: false, message: 'Insufficient points' });
        }
        const discountValue = pointsToRedeem * 0.1;
        user.loyaltyPoints -= pointsToRedeem;
        user.loyaltyTier = getTier(user.loyaltyPoints);
        await user.save();

        res.json({
            success: true,
            message: `Redeemed ${pointsToRedeem} points for ₹${discountValue} discount`,
            discountValue,
            remainingPoints: user.loyaltyPoints,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



// ===============================
// @desc   Loyalty leaderboard
// ===============================
exports.getLeaderboard = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const leaderboard = await Loyalty.find()
            .sort({ lifetimeEarned: -1 })
            .limit(20)
            .populate({
                path: 'customer',
                select: 'name email'
            });

        res.json({
            success: true,
            leaderboard
        });

    } catch (err) {
        next(err);
    }
};