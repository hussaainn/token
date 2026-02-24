const jwt = require('jsonwebtoken');
const User = require('../models/User');


// ===============================
// Protect Route - Verify JWT
// ===============================
const protect = async (req, res, next) => {
    try {
        let token;

        // 1️⃣ Get token from header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer ')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Optional: Support cookies (SaaS upgrade ready)
        if (!token && req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token missing'
            });
        }

        // 2️⃣ Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3️⃣ Get user
        const user = await User.findById(decoded.id)
            .select('-password -refreshToken');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        req.user = user;

        next();

    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Token invalid or expired'
        });
    }
};



// ===============================
// Role-Based Authorization
// ===============================
const authorize = (...roles) => {
    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.user.role}' not authorized`
            });
        }

        next();
    };
};

module.exports = { protect, authorize };