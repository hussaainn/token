const express = require('express');
const router = express.Router();
const { submitReview, getServiceReviews, getStaffReviews, getAllReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin'), getAllReviews);

router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
    try {
        const Review = require('../models/Review');
        const reviews = await Review.find()
            .populate('customer', 'name email')
            .populate('service', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, reviews });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', protect, authorize('customer'), submitReview);
router.get('/service/:id', getServiceReviews);
router.get('/staff/:id', getStaffReviews);

module.exports = router;
