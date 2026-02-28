const express = require('express');
const router = express.Router();
const { updateLocation, getSalonLocation } = require('../controllers/geoController');
const { protect } = require('../middleware/authMiddleware');

router.get('/salon', getSalonLocation);
router.post('/update', protect, updateLocation);

module.exports = router;
