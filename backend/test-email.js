require('dotenv').config();
const nodemailer = require('nodemailer');

// Manually load config to ensure we see exactly what's being used
const smtpConfig = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
};

async function testEmail() {
    console.log('----------------------------------------');
    console.log('📧 ELASTIC EMAIL DEBUGGER');
    console.log('----------------------------------------');
    console.log('Host:', smtpConfig.host);
    console.log('Port:', smtpConfig.port);
    console.log('User:', smtpConfig.auth.user);
    console.log('Pass:', smtpConfig.auth.pass ? `${smtpConfig.auth.pass.substring(0, 4)}... (Hidden)` : 'MISSING');
    console.log('----------------------------------------');

    if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
        console.error('❌ CRITICAL: SMTP Credentials missing in .env!');
        console.log('Please check backend/.env file.');
        return;
    }

    const transporter = nodemailer.createTransport(smtpConfig);

    try {
        console.log('1. Attempting to connect to SMTP server...');
        await transporter.verify();
        console.log('✅ Connection Successful! Credentials are valid.');

        console.log('2. Sending test email...');
        const info = await transporter.sendMail({
            from: smtpConfig.auth.user,
            to: process.env.ADMIN_EMAIL || smtpConfig.auth.user,
            subject: 'Test Email from Design Maker',
            text: 'It works! Your email configuration is correct.',
            html: '<h3>It works!</h3><p>Your email configuration is correct.</p>'
        });

        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('----------------------------------------');
        console.log('👉 If you see this, the website should work too.');
        console.log('👉 Don\'t forget to RESTART the backend: npm run dev');

    } catch (error) {
        console.error('❌ ERROR FAILED:');
        console.error(error);

        if (error.code === 'EAUTH') {
            console.log('\n💡 TIP: Authentication failed. Check your Username or API Key.');
        } else if (error.code === 'ESOCKET') {
            console.log('\n💡 TIP: Connection failed. Port 2525 might be blocked. Try port 587 or 465.');
        }
    }
}

testEmail();
