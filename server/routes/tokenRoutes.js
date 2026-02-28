const express = require('express');
const router = express.Router();
const {
    bookToken, getLiveQueue, getMyTokens, getToken,
    updateTokenStatus, cancelToken, rescheduleToken,
    qrCheckIn, getWaitingTime, getAllTokens, callNext
} = require('../controllers/tokenController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/queue', getLiveQueue);
router.get('/waiting-time', getWaitingTime);
router.post('/checkin', protect, authorize('customer', 'admin', 'staff'), qrCheckIn);
router.get('/my', protect, authorize('customer'), getMyTokens);
router.get('/', protect, authorize('admin', 'staff'), getAllTokens);
router.post('/', protect, authorize('customer'), bookToken);
router.get('/:id', protect, getToken);
router.patch('/:id/status', protect, authorize('admin', 'staff'), updateTokenStatus);
router.patch('/:id/cancel', protect, cancelToken);
router.patch('/:id/reschedule', protect, authorize('customer'), rescheduleToken);
router.post('/call-next', protect, authorize('admin', 'staff'), callNext);

module.exports = router;
