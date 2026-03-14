const express = require('express');
const router = express.Router();
const {
    bookToken, getLiveQueue, getMyTokens, getToken,
    updateTokenStatus, cancelToken, rescheduleToken,
    qrCheckIn, getWaitingTime, getAllTokens, callNext, getAvailableSlots
} = require('../controllers/tokenController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/queue', getLiveQueue);
router.get('/waiting-time', getWaitingTime);
router.get('/available-slots', getAvailableSlots);
router.post('/checkin', protect, authorize('customer', 'admin', 'staff'), qrCheckIn);
router.get('/my', protect, authorize('customer'), getMyTokens);
router.get('/my-assigned', protect, authorize('staff'), require('../controllers/tokenController').getMyAssignedTokens);
router.get('/', protect, authorize('admin', 'staff'), getAllTokens);
router.post('/walkin', protect, authorize('admin', 'staff'), require('../controllers/tokenController').addWalkInToken);
router.post('/', protect, authorize('customer'), bookToken);
router.get('/:id', protect, getToken);
router.post('/:id/addons', protect, authorize('admin', 'staff', 'customer'), require('../controllers/tokenController').addAddOnService);
router.patch('/:id/status', protect, authorize('admin', 'staff'), updateTokenStatus);
router.patch('/:id/cancel', protect, cancelToken);
router.patch('/:id/reschedule', protect, authorize('customer'), rescheduleToken);
router.patch('/:id/arrival', protect, authorize('customer'), require('../controllers/tokenController').updateArrivalStatus);
router.patch('/:id/accept', protect, authorize('admin', 'staff'), require('../controllers/tokenController').acceptToken);
router.post('/call-next', protect, authorize('admin', 'staff'), callNext);

module.exports = router;
