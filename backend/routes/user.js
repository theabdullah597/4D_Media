const express = require('express');
const router = express.Router();
const db = require('../database/db');
const authUser = require('../middleware/auth_user');

// GET /api/user/profile
router.get('/profile', authUser, async (req, res) => {
    try {
        const user = await db.get('SELECT id, full_name, email, phone, address_line1, address_line2, city, postcode FROM users WHERE id = ?', [req.user.id]);
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/user/orders
router.get('/orders', authUser, async (req, res) => {
    try {
        const orders = await db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
