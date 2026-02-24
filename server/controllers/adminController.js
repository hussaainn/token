const Token = require('../models/Token');
const User = require('../models/User');
const Service = require('../models/Service');
const Payment = require('../models/Payment');
const Review = require('../models/Review');


// ===============================
// @desc   Admin dashboard stats
// @route  GET /api/admin/dashboard
// ===============================
exports.getDashboard = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const [
            totalTokensToday,
            activeTokens,
            completedToday,
            cancelledToday,
            totalCustomers,
            totalStaff,
            revenueToday,
            topServices,
            hourlyDistribution,
            staffPerformance,
        ] = await Promise.all([

            // Tokens today
            Token.countDocuments({ date: { $gte: today, $lt: tomorrow } }),

            // Active tokens
            Token.countDocuments({ status: { $in: ['waiting', 'serving'] } }),

            // Completed today
            Token.countDocuments({
                status: 'completed',
                date: { $gte: today, $lt: tomorrow }
            }),

            // Cancelled today
            Token.countDocuments({
                status: 'cancelled',
                date: { $gte: today, $lt: tomorrow }
            }),

            // Total customers
            User.countDocuments({ role: 'customer' }),

            // Active staff
            User.countDocuments({ role: 'staff', isActive: true }),

            // Revenue today
            Payment.aggregate([
                {
                    $match: {
                        status: 'completed',
                        createdAt: { $gte: today, $lt: tomorrow }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$finalAmount' }
                    }
                }
            ]),

            // 🔥 Top 5 services THIS MONTH
            Token.aggregate([
                { $match: { date: { $gte: startOfMonth } } },
                { $group: { _id: '$service', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: 'services',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'service'
                    }
                },
                { $unwind: '$service' },
                {
                    $project: {
                        name: '$service.name',
                        price: '$service.price',
                        count: 1
                    }
                }
            ]),

            // 🔥 Hourly booking distribution (safe method)
            Token.aggregate([
                { $match: { date: { $gte: today, $lt: tomorrow } } },
                {
                    $project: {
                        hour: { $hour: '$date' }
                    }
                },
                { $group: { _id: '$hour', count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]),

            // 🔥 Staff performance
            Token.aggregate([
                {
                    $match: {
                        status: 'completed',
                        date: { $gte: today, $lt: tomorrow },
                        staff: { $ne: null }
                    }
                },
                { $group: { _id: '$staff', completed: { $sum: 1 } } },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'staff'
                    }
                },
                { $unwind: '$staff' },
                {
                    $project: {
                        name: '$staff.name',
                        completed: 1
                    }
                },
                { $sort: { completed: -1 } }
            ])

        ]);

        res.json({
            success: true,
            stats: {
                totalTokensToday,
                activeTokens,
                completedToday,
                cancelledToday,
                totalCustomers,
                totalStaff,
                revenueToday: revenueToday[0]?.total || 0,
            },
            topServices,
            hourlyDistribution,
            staffPerformance,
        });

    } catch (err) {
        next(err);
    }
};



// ===============================
// @desc   Get all staff
// ===============================
exports.getStaff = async (req, res, next) => {
    try {
        const staff = await User.find({ role: 'staff' })
            .sort({ name: 1 })
            .select('-password');

        res.json({
            success: true,
            count: staff.length,
            staff
        });
    } catch (err) {
        next(err);
    }
};



// ===============================
// @desc   Add staff
// ===============================
exports.addStaff = async (req, res, next) => {
    try {
        const { name, email, password, phone, specialization } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        const staff = await User.create({
            name,
            email,
            password,
            phone,
            specialization,
            role: 'staff',
            isActive: true
        });

        res.status(201).json({
            success: true,
            staff
        });

    } catch (err) {
        next(err);
    }
};



// ===============================
// @desc   Update staff
// ===============================
exports.updateStaff = async (req, res, next) => {
    try {
        const staff = await User.findOneAndUpdate(
            { _id: req.params.id, role: 'staff' },
            {
                name: req.body.name,
                phone: req.body.phone,
                specialization: req.body.specialization,
                isActive: req.body.isActive
            },
            { new: true, runValidators: true }
        );

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff not found'
            });
        }

        res.json({
            success: true,
            staff
        });

    } catch (err) {
        next(err);
    }
};



// ===============================
// @desc   Remove staff (Soft delete)
// ===============================
exports.removeStaff = async (req, res, next) => {
    try {
        const staff = await User.findOneAndUpdate(
            { _id: req.params.id, role: 'staff' },
            { isActive: false },
            { new: true }
        );

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff not found'
            });
        }

        res.json({
            success: true,
            message: 'Staff deactivated'
        });

    } catch (err) {
        next(err);
    }
};



// ===============================
// @desc   Analytics (Last 30 Days)
// ===============================
exports.getAnalytics = async (req, res, next) => {
    try {
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);

        const [dailyRevenue, servicePopularity, noShowRate] = await Promise.all([

            // Daily revenue
            Payment.aggregate([
                {
                    $match: {
                        status: 'completed',
                        createdAt: { $gte: monthAgo }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: '%Y-%m-%d',
                                date: '$createdAt'
                            }
                        },
                        revenue: { $sum: '$finalAmount' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),

            // Service popularity
            Token.aggregate([
                { $match: { createdAt: { $gte: monthAgo } } },
                { $group: { _id: '$service', count: { $sum: 1 } } },
                {
                    $lookup: {
                        from: 'services',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'service'
                    }
                },
                { $unwind: '$service' },
                {
                    $project: {
                        name: '$service.name',
                        category: '$service.category',
                        count: 1
                    }
                },
                { $sort: { count: -1 } }
            ]),

            // No-show rate
            Token.aggregate([
                {
                    $match: {
                        createdAt: { $gte: monthAgo },
                        status: { $in: ['completed', 'no-show'] }
                    }
                },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ])

        ]);

        res.json({
            success: true,
            dailyRevenue,
            servicePopularity,
            noShowRate
        });

    } catch (err) {
        next(err);
    }
};



// ===============================
// @desc   Get all customers
// ===============================
exports.getCustomers = async (req, res, next) => {
    try {
        const customers = await User.find({ role: 'customer' })
            .sort({ createdAt: -1 })
            .select('name email phone loyaltyPoints createdAt');

        res.json({
            success: true,
            count: customers.length,
            customers
        });

    } catch (err) {
        next(err);
    }
};