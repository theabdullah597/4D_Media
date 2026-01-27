const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Middleware to verify JWT token for admin routes
 */
function authenticateAdmin(req, res, next) {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(token, config.jwtSecret);

        // Add admin info to request
        req.admin = decoded;

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }
}

/**
 * Generate JWT token for admin
 */
function generateToken(admin) {
    return jwt.sign(
        {
            id: admin.id,
            username: admin.username,
            email: admin.email
        },
        config.jwtSecret,
        { expiresIn: config.jwtExpiry }
    );
}

module.exports = {
    authenticateAdmin,
    generateToken
};
