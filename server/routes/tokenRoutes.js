const express = require('express');
const router = express.Router();
const {
    bookToken, getLiveQueue, getMyTokens, getToken,
    updateTokenStatus, cancelToken, rescheduleToken,
<<<<<<< HEAD
    qrCheckIn, getWaitingTime, getAllTokens, callNext, getAvailableSlots
=======
    qrCheckIn, getWaitingTime, getAllTokens, callNext
>>>>>>> df36bf6cc73aa31f12c1ca87b2e06d5d17eb4f1f
} = require('../controllers/tokenController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/queue', getLiveQueue);
router.get('/waiting-time', getWaitingTime);
<<<<<<< HEAD
router.get('/available-slots', getAvailableSlots);
router.post('/checkin', protect, authorize('customer', 'admin', 'staff'), qrCheckIn);
router.get('/my', protect, authorize('customer'), getMyTokens);
router.get('/my-assigned', protect, authorize('staff'), require('../controllers/tokenController').getMyAssignedTokens);
router.get('/', protect, authorize('admin', 'staff'), getAllTokens);
router.post('/walkin', protect, authorize('admin', 'staff'), require('../controllers/tokenController').addWalkInToken);
=======
router.post('/checkin', protect, authorize('customer', 'admin', 'staff'), qrCheckIn);
router.get('/my', protect, authorize('customer'), getMyTokens);
router.get('/', protect, authorize('admin', 'staff'), getAllTokens);
>>>>>>> df36bf6cc73aa31f12c1ca87b2e06d5d17eb4f1f
router.post('/', protect, authorize('customer'), bookToken);
router.get('/:id', protect, getToken);
router.patch('/:id/status', protect, authorize('admin', 'staff'), updateTokenStatus);
router.patch('/:id/cancel', protect, cancelToken);
router.patch('/:id/reschedule', protect, authorize('customer'), rescheduleToken);
router.post('/call-next', protect, authorize('admin', 'staff'), callNext);
<<<<<<< HEAD
router.post('/:id/claim', protect, authorize('staff'), require('../controllers/tokenController').claimToken);
=======
>>>>>>> df36bf6cc73aa31f12c1ca87b2e06d5d17eb4f1f

module.exports = router;
