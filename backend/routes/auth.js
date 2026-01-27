const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const { jwtSecret } = require('../config/config');

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { full_name, email, password, phone } = req.body;

        // Basic check
        if (!full_name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Check if user exists
        const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const result = await db.run(
            'INSERT INTO users (full_name, email, password, phone) VALUES (?, ?, ?, ?)',
            [full_name, email, hashedPassword, phone]
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: { id: result.id, email }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, email: user.email, type: 'user' }, jwtSecret, { expiresIn: '7d' });

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

const authUser = require('../middleware/auth_user');

// GET /api/auth/me
router.get('/me', authUser, async (req, res) => {
    try {
        const user = await db.get('SELECT id, full_name, email FROM users WHERE id = ?', [req.user.id]);
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT /api/auth/change-password
router.put('/change-password', authUser, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Validate strong password
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!strongPasswordRegex.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
            });
        }

        // Get user to check current password
        const user = await db.get('SELECT password FROM users WHERE id = ?', [req.user.id]);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Incorrect current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

        res.json({ success: true, message: 'Password updated successfully' });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset code
 */
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await db.get('SELECT id FROM users WHERE email = ?', [email]);

        if (!user) {
            // For security, don't reveal existence, but need to return simplified success
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Simplified Flow: No token generation
        res.json({ success: true, message: 'User verification successful' });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * POST /api/auth/reset-password
 * Reset password using code
 */
router.post('/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        const user = await db.get('SELECT id FROM users WHERE email = ?', [email]);

        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        // Validate strong password
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!strongPasswordRegex.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password only
        await db.run(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, user.id]
        );

        res.json({ success: true, message: 'Password reset successful' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
