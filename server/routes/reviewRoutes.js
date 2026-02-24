const express = require('express');
const router = express.Router();
const { submitReview, getServiceReviews, getStaffReviews, getAllReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin'), getAllReviews);
router.post('/', protect, authorize('customer'), submitReview);
router.get('/service/:id', getServiceReviews);
router.get('/staff/:id', getStaffReviews);

module.exports = router;
