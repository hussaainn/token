const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { register, login, refreshToken, getMe, updateProfile, changePassword, forgotPassword, resetPassword } = require('../controllers/authController');
=======
const { register, login, refreshToken, getMe, updateProfile, changePassword } = require('../controllers/authController');
>>>>>>> df36bf6cc73aa31f12c1ca87b2e06d5d17eb4f1f
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
<<<<<<< HEAD
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
=======
>>>>>>> df36bf6cc73aa31f12c1ca87b2e06d5d17eb4f1f

module.exports = router;
