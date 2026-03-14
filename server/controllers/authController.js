const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Loyalty = require('../models/Loyalty');
const sendEmail = require('../utils/sendEmail');


// ===============================
// Token Helpers
// ===============================
const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });

const signRefresh = (id) =>
    jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
    });


// ===============================
// @desc   Register user
// ===============================
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;

        // 🔒 Prevent public staff creation
        const role = 'customer';

        // Check duplicate email
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            phone,
            role
        });

        // Create loyalty account
        await Loyalty.create({ customer: user._id });

        const token = signToken(user._id);
        const refreshToken = signRefresh(user._id);

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        user.password = undefined;
        user.refreshToken = undefined;

        res.status(201).json({
            success: true,
            token,
            refreshToken,
            user
        });

    } catch (err) {
        next(err);
    }
};



// ===============================
// @desc   Login
// ===============================
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password required'
            });
        }

        const user = await User.findOne({ email })
            .select('+password +refreshToken');

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        const token = signToken(user._id);
        const refreshToken = signRefresh(user._id);

        // 🔄 Refresh token rotation
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        user.password = undefined;
        user.refreshToken = undefined;

        res.json({
            success: true,
            token,
            refreshToken,
            user
        });

    } catch (err) {
        next(err);
    }
};



// ===============================
// @desc   Refresh token
// ===============================
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token required'
            });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        const user = await User.findById(decoded.id)
            .select('+refreshToken');

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        // 🔄 Rotate refresh token again
        const newAccessToken = signToken(user._id);
        const newRefreshToken = signRefresh(user._id);

        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        res.json({
            success: true,
            token: newAccessToken,
            refreshToken: newRefreshToken
        });

    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Token expired or invalid'
        });
    }
};



// ===============================
// @desc   Get current user
// ===============================
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password -refreshToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });

    } catch (err) {
        next(err);
    }
};



// ===============================
// @desc   Update profile
// ===============================
exports.updateProfile = async (req, res, next) => {
    try {
        const allowedFields = [
            'name',
            'phone',
            'fcmToken',
            'webPushSubscription'
        ];

        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        ).select('-password -refreshToken');

        res.json({
            success: true,
            user
        });

    } catch (err) {
        next(err);
    }
};



// ===============================
// @desc   Change password
// ===============================
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Both current and new password required'
            });
        }

        const user = await User.findById(req.user._id)
            .select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password incorrect'
            });
        }

        user.password = newPassword;
        user.refreshToken = undefined; // 🔒 invalidate sessions
        await user.save();

        res.json({
            success: true,
            message: 'Password updated successfully'
        });

    } catch (err) {
        next(err);
    }
};

// ===============================
// @desc   Forgot password
// ===============================
exports.forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            // Return success even if user not found to prevent email enumeration
            return res.status(200).json({ success: true, message: 'Email sent' });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        // Create reset url
        // In a real app, you would use req.protocol and req.get('host') or an env variable for the frontend URL
        // However, we are assuming the frontend is running on localhost:5173 or similar, or we just send the relative path for the demo
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password reset token',
                message
            });

            res.status(200).json({ success: true, message: 'Email sent' });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            // We return 200 instead of 500 here because of the critical requirement
            // that the app must still work if email fails
            console.error('Failed to send email:', err);
            return res.status(200).json({ success: true, message: 'Email sending failed but token generated.' });
        }
    } catch (err) {
        next(err);
    }
};

// ===============================
// @desc   Reset password
// ===============================
exports.resetPassword = async (req, res, next) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.refreshToken = undefined; // Force re-login on other devices

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful. Please log in with your new password.',
        });
    } catch (err) {
        next(err);
    }
};