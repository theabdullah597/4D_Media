require('dotenv').config();

module.exports = {
    // Server configuration
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // Database configuration
    databasePath: process.env.DATABASE_PATH || './database/4dmedia.db',

    // MySQL configuration
    mysql: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'design_maker_db'
    },

    // JWT configuration
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    jwtExpiry: process.env.JWT_EXPIRY || '24h',

    // File upload configuration
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 20 * 1024 * 1024, // 20MB default
    allowedFileTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'],

    // Email configuration (SMTP)
    smtp: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    },
    adminEmail: process.env.ADMIN_EMAIL || 'admin@4dmedia.com',

    // Frontend URL (for CORS)
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

    // WhatsApp configuration
    whatsappNumber: process.env.WHATSAPP_NUMBER || '1234567890' // Replace with actual number
};
