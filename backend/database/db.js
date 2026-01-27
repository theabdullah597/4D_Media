const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '4dmedia.db');
const dbDir = path.dirname(dbPath);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite database');
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

/**
 * Initialize database with schema and seed data
 */
function initializeDatabase() {
    return new Promise((resolve, reject) => {
        // Check if database is already initialized
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='admins'", (err, row) => {
            if (err) {
                reject(err);
                return;
            }

            if (row) {
                console.log('Database already initialized');
                resolve();
                return;
            }

            console.log('Initializing database...');

            // Read and execute schema
            const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

            db.exec(schema, (err) => {
                if (err) {
                    console.error('Error creating schema:', err.message);
                    reject(err);
                    return;
                }

                console.log('Schema created successfully');

                // Read and execute seeds
                const seeds = fs.readFileSync(path.join(__dirname, 'seeds.sql'), 'utf8');

                db.exec(seeds, (err) => {
                    if (err) {
                        console.error('Error seeding database:', err.message);
                        reject(err);
                        return;
                    }

                    console.log('Database seeded successfully');
                    resolve();
                });
            });
        });
    });
}

/**
 * Run a query that returns all matching rows
 */
function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

/**
 * Run a query that returns a single row
 */
function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

/**
 * Run a query that modifies data (INSERT, UPDATE, DELETE)
 */
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });
}

/**
 * Begin a transaction
 */
function beginTransaction() {
    return run('BEGIN TRANSACTION');
}

/**
 * Commit a transaction
 */
function commit() {
    return run('COMMIT');
}

/**
 * Rollback a transaction
 */
function rollback() {
    return run('ROLLBACK');
}

/**
 * Close database connection
 */
function close() {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

module.exports = {
    db,
    initializeDatabase,
    all,
    get,
    run,
    beginTransaction,
    commit,
    rollback,
    close
};
