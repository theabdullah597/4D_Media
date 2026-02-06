const express = require('express');
const cors = require('cors');
const path = require('path');

// Global error handling for startup/runtime crashes
process.on('uncaughtException', (err) => {
    console.error('CRITICAL ERROR (Uncaught Exception):', err);
    console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL ERROR (Unhandled Rejection):', reason);
});
const config = require('./config/config');
const db = require('./database/db');

const app = express();

// Middleware
app.use(cors({
    origin: config.frontendUrl,
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    next();
}, express.static(path.join(__dirname, config.uploadDir)));

// API Routes
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth'); // Customer auth
const userRoutes = require('./routes/user'); // Customer profile
const generalRoutes = require('./routes/general'); // Contact, etc.

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/general', generalRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: '4D Media API is running',
        timestamp: new Date().toISOString()
    });
});

// Serve frontend in production
if (config.nodeEnv === 'production') {
    // Support Hostinger/VPS deployment (serving from ./public)
    app.use(express.static(path.join(__dirname, 'public')));
    // Support Render/Monorepo deployment (serving from ../frontend/dist)
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    app.get('*', (req, res) => {
        const fs = require('fs');
        const publicIndex = path.join(__dirname, 'public', 'index.html');

        if (fs.existsSync(publicIndex)) {
            res.sendFile(publicIndex);
        } else {
            res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
        }
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Initialize database and start server
async function startServer() {
    try {
        console.log('Initializing database...');
        await db.initializeDatabase();
        console.log('Database ready');

        app.listen(config.port, () => {
            console.log(`\n 4D Media Server running on port ${config.port}`);
            console.log(` Environment: ${config.nodeEnv}`);
            console.log(` API: http://localhost:${config.port}/api`);
            console.log(` Max Upload: ${config.maxFileSize / 1024 / 1024}MB`);
            if (config.nodeEnv === 'development') {
                console.log(` Frontend: ${config.frontendUrl}`);
            }
            console.log('\nServer ready to accept requests\n');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await db.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\nShutting down gracefully...');
    await db.close();
    process.exit(0);
});

startServer();

module.exports = app;
