const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { getNotifications, markRead, markAllRead, subscribe, sendPushNotification } = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/authMiddleware');
=======
const { getNotifications, markRead, markAllRead, subscribe } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
>>>>>>> df36bf6cc73aa31f12c1ca87b2e06d5d17eb4f1f

router.use(protect);
router.get('/', getNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);
router.post('/subscribe', subscribe);
<<<<<<< HEAD
router.post('/send', authorize('admin', 'staff'), sendPushNotification);
=======
>>>>>>> df36bf6cc73aa31f12c1ca87b2e06d5d17eb4f1f

module.exports = router;
