const User = require('../models/User');

// @desc   Get all active staff
// @route  GET /api/staff
// @access Private (Any authenticated user)
exports.getStaff = async (req, res, next) => {
    try {
        const staff = await User.find({ role: 'staff', isActive: true })
            .select('name specialization avatar phone')
            .sort({ name: 1 });

        res.json({ success: true, count: staff.length, staff });
    } catch (err) {
        next(err);
    }
};
