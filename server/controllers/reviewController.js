const Review = require('../models/Review');
const Service = require('../models/Service');
const Token = require('../models/Token');


// ===============================
// @desc   Submit review
// ===============================
exports.submitReview = async (req, res, next) => {
    try {
        if (req.user.role !== 'customer') {
            return res.status(403).json({
                success: false,
                message: 'Only customers can submit reviews'
            });
        }

        const { tokenId, rating, staffRating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        if (staffRating && (staffRating < 1 || staffRating > 5)) {
            return res.status(400).json({
                success: false,
                message: 'Staff rating must be between 1 and 5'
            });
        }

        const token = await Token.findById(tokenId);

        if (!token) {
            return res.status(404).json({
                success: false,
                message: 'Token not found'
            });
        }

        if (token.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not your token'
            });
        }

        if (token.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Can only review completed services'
            });
        }

        const existing = await Review.findOne({
            token: tokenId,
            customer: req.user._id
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Already reviewed this service'
            });
        }

        const review = await Review.create({
            token: tokenId,
            customer: req.user._id,
            service: token.service,
            staff: token.staff || null,
            rating,
            staffRating: staffRating || null,
            comment
        });

        // 🔥 Update service average using aggregation (scalable)
        const serviceStats = await Review.aggregate([
            { $match: { service: token.service, isVisible: true } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: "$rating" },
                    total: { $sum: 1 }
                }
            }
        ]);

        if (serviceStats.length > 0) {
            await Service.findByIdAndUpdate(token.service, {
                averageRating: Math.round(serviceStats[0].avgRating * 10) / 10,
                totalReviews: serviceStats[0].total
            });
        }

        res.status(201).json({
            success: true,
            review
        });

    } catch (err) {
        next(err);
    }
};



// ===============================
// @desc   Get reviews for a service
// ===============================
exports.getServiceReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({
            service: req.params.id,
            isVisible: true
        })
            .sort({ createdAt: -1 })
            .populate('customer', 'name');

        res.json({
            success: true,
            count: reviews.length,
            reviews
        });

    } catch (err) {
        next(err);
    }
};



// ===============================
// @desc   Get reviews for staff
// ===============================
exports.getStaffReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({
            staff: req.params.id,
            isVisible: true
        })
            .sort({ createdAt: -1 })
            .populate('customer', 'name')
            .populate('service', 'name');

        const avg =
            reviews.length > 0
                ? reviews.reduce(
                    (a, r) => a + (r.staffRating || r.rating),
                    0
                ) / reviews.length
                : 0;

        res.json({
            success: true,
            count: reviews.length,
            averageRating: Math.round(avg * 10) / 10,
            reviews
        });

    } catch (err) {
        next(err);
    }
};



// ===============================
// @desc   Get all reviews (admin)
// ===============================
exports.getAllReviews = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const reviews = await Review.find()
            .sort({ createdAt: -1 })
            .populate('customer', 'name')
            .populate('service', 'name')
            .populate('staff', 'name');

        res.json({
            success: true,
            count: reviews.length,
            reviews
        });

    } catch (err) {
        next(err);
    }
};