const Loyalty = require('../models/Loyalty');
const User = require('../models/User');


// ===============================
// @desc   Get my loyalty account
// ===============================
exports.getMyLoyalty = async (req, res, next) => {
    try {
        if (req.user.role !== 'customer') {
            return res.status(403).json({
                success: false,
                message: 'Only customers have loyalty accounts'
            });
        }

        let loyalty = await Loyalty.findOne({ customer: req.user._id });

        if (!loyalty) {
            loyalty = await Loyalty.create({ customer: req.user._id });
        }

        res.json({
            success: true,
            loyalty
        });

    } catch (err) {
        next(err);
    }
};



// ===============================
// @desc   Redeem loyalty points
// Rule: 100 points = ₹50 discount
// ===============================
exports.redeemPoints = async (req, res, next) => {
    try {
        if (req.user.role !== 'customer') {
            return res.status(403).json({
                success: false,
                message: 'Only customers can redeem points'
            });
        }

        const { points } = req.body;

        if (!points || points <= 0 || points % 100 !== 0) {
            return res.status(400).json({
                success: false,
                message: 'Points must be a positive multiple of 100'
            });
        }

        const loyalty = await Loyalty.findOne({ customer: req.user._id });

        if (!loyalty) {
            return res.status(404).json({
                success: false,
                message: 'Loyalty account not found'
            });
        }

        if (loyalty.totalPoints < points) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient loyalty points'
            });
        }

        // 100 points = ₹50 → 1 point = ₹0.5
        const discountAmount = (points / 100) * 50;

        loyalty.totalPoints -= points;
        loyalty.lifetimeRedeemed += points;

        loyalty.history.push({
            type: 'redeemed',
            points,
            description: `Redeemed ${points} points for ₹${discountAmount} discount`
        });

        loyalty.updateTier();
        await loyalty.save();

        // Sync with User model
        await User.findByIdAndUpdate(req.user._id, {
            loyaltyPoints: loyalty.totalPoints
        });

        res.json({
            success: true,
            discountAmount,
            loyalty,
            message: `${points} points redeemed for ₹${discountAmount} discount`
        });

    } catch (err) {
        next(err);
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