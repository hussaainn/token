const express = require('express');
const router = express.Router();
const { getMyLoyalty, redeemPoints, getLeaderboard } = require('../controllers/loyaltyController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/me', protect, authorize('customer'), getMyLoyalty);
router.post('/redeem', protect, authorize('customer'), redeemPoints);
router.get('/leaderboard', protect, authorize('admin'), getLeaderboard);

module.exports = router;
