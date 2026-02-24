const express = require('express');
const router = express.Router();
const { getStaff } = require('../controllers/staffController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected by JWT, but available to all roles (customer, staff, admin)
router.get('/', protect, getStaff);

module.exports = router;
