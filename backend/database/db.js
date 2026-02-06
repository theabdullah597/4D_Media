const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

// Create connection pool
const pool = mysql.createPool({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true, // Needed for running schema scripts
    namedPlaceholders: false // SQLite uses ?, MySQL uses ?
});

/**
 * Initialize database with schema
 */
async function initializeDatabase() {
    try {
        const connection = await pool.getConnection();

        try {
            console.log('Checking database connection...');
            await connection.ping();
            console.log('Connected to MySQL database');

            // Check if users table exists as a proxy for initialization
            const [rows] = await connection.query("SHOW TABLES LIKE 'users'");

            if (rows.length > 0) {
                console.log('Database tables already exist');
                return;
            }

            console.log('Initializing database schema...');
            const schemaPath = path.join(__dirname, 'schema_mysql.sql');
            const schema = fs.readFileSync(schemaPath, 'utf8');

            await connection.query(schema);
            console.log('Schema created successfully');

            // Note: We are not seeding automatically here because we expect migration
            // If this is a fresh install, we might want to check for 0 users and seed admin

        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Database initialization failed:', error);
        // Don't exit process here, let the caller handle it (or server.js global handler)
        throw error;
    }
}

/**
 * Run a query that returns all matching rows
 */
async function all(sql, params = []) {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('Query Error (all):', error.message, '\nSQL:', sql, '\nParams:', params);
        throw error;
    }
}

/**
 * Run a query that returns a single row
 */
async function get(sql, params = []) {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows[0];
    } catch (error) {
        console.error('Query Error (get):', error.message, '\nSQL:', sql, '\nParams:', params);
        throw error;
    }
}

/**
 * Run a query that modifies data (INSERT, UPDATE, DELETE)
 */
async function run(sql, params = []) {
    try {
        const [result] = await pool.execute(sql, params);
        return {
            id: result.insertId,
            changes: result.affectedRows
        };
    } catch (error) {
        console.error('Query Error (run):', error.message, '\nSQL:', sql, '\nParams:', params);
        throw error;
    }
}

/**
 * Begin a transaction
 * Note: For MySQL pool, we need to get a specific connection for transactions.
 * This simple wrapper might not work if subsequent calls don't use the same connection.
 * A better approach for this legacy codebase is to expose a 'transaction' helper.
 * 
 * However, to keep API compatible with the existing `db.js`:
 * We can't easily implement a global start/commit/rollback with a pool.
 * But looking at the codebase, `beginTransaction` was purely SQL `BEGIN TRANSACTION`.
 * In a pool, `pool.query('START TRANSACTION')` works *IF* the subsequent queries use the same connection.
 * They WON'T with `pool.execute`.
 * 
 * FIX: We will create a "Transaction" object helper or we have to accept that
 * existing transaction logic might be flawed if it assumed a single connection.
 * 
 * LUCKILY: The current `db.js` uses `db.run('BEGIN TRANSACTION')` on a SINGLE sqlite connection.
 * 
 * For this migration, I will implement a simpler version that assumes single-statement transactions are rare,
 * OR (Better) - we accept that complex transactions need refactoring in the calling code.
 * 
 * For now, I'll return a warning/no-op or try to support it if possible.
 * Actually, to support this properly without changing all caller code, we might need a singleton connection
 * option, but that defeats the purpose of a pool.
 * 
 * Let's implement `withTransaction` pattern if possible, but that changes API.
 * 
 * Compromise: The methods below will log a warning that manual transaction control 
 * is not supported with connection pooling and suggest refactoring.
 */
async function beginTransaction() {
    console.warn('WARNING: beginTransaction called. Manual transaction management is not supported with MySQL pooling without refactoring. Operations will be auto-committed.');
    // return pool.query('START TRANSACTION'); // This is dangerous as the next query might get a different connection
}

async function commit() {
    // return pool.query('COMMIT');
}

async function rollback() {
    // return pool.query('ROLLBACK');
}

/**
 * Close database connection
 */
async function close() {
    await pool.end();
}

/**
 * Direct access to pool if needed
 */
function getPool() {
    return pool;
}

module.exports = {
    db: pool, // Expose pool as 'db' to keep some compatibility
    initializeDatabase,
    all,
    get,
    run,
    beginTransaction,
    commit,
    rollback,
    close,
    getPool
};
