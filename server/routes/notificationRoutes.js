const express = require('express');
const router = express.Router();
const { getNotifications, markRead, markAllRead, subscribe } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);
router.post('/subscribe', subscribe);

module.exports = router;
