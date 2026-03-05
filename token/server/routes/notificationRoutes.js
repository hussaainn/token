const express = require('express');
const router = express.Router();
const { getNotifications, markRead, markAllRead, subscribe, sendPushNotification } = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);
router.post('/subscribe', subscribe);
router.post('/send', authorize('admin', 'staff'), sendPushNotification);

module.exports = router;
