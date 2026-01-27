const express = require('express');
const router = express.Router();
const config = require('../config/config');
const nodemailer = require('nodemailer');

// Helper to create transporter (duplicate logic from utils/email.js but simple enough here or import)
const { sendOrderNotification } = require('../utils/email'); // We might want to export the transporter creation or make a generic send function

// Generic Email Sender
const sendEmail = async ({ to, subject, html, replyTo }) => {
    if (!config.smtp.auth.user || !config.smtp.auth.pass) {
        console.warn('SMTP not configured');
        return false;
    }

    const transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: {
            user: config.smtp.auth.user,
            pass: config.smtp.auth.pass
        }
    });

    try {
        const info = await transporter.sendMail({
            from: `"4D Media Contact" <${config.smtp.auth.user}>`,
            to,
            replyTo: replyTo || config.smtp.auth.user,
            subject,
            html
        });
        console.log('Email sent:', info.messageId);
        return true;
    } catch (e) {
        console.error('Email Error:', e);
        throw e;
    }
};

/**
 * POST /api/general/contact
 * Handle contact form submission
 */
router.post('/contact', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const emailContent = `
            <h3>New Contact Message</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p><strong>Message:</strong></p>
            <p style="background: #f5f5f5; padding: 15px; border-left: 4px solid #7000ff;">${message}</p>
        `;

        // Send to Admin
        await sendEmail({
            to: config.adminEmail,
            subject: `Contact Form Message from ${name}`,
            html: emailContent,
            replyTo: email
        });

        res.json({ success: true, message: 'Message sent successfully' });

    } catch (error) {
        console.error('Contact error:', error);
        res.status(500).json({ success: false, message: 'Failed to send message: ' + error.message });
    }
});

module.exports = router;
