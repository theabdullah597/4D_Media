const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('./config/config');

const dbPath = path.join(__dirname, 'database/4dmedia.db');
const db = new sqlite3.Database(dbPath);

console.log('Migrating database for Password Reset functionality...');

db.serialize(() => {
    // Check if columns exist
    db.all("PRAGMA table_info(users)", (err, columns) => {
        if (err) {
            console.error('Error reading table info:', err);
            return;
        }

        const columnNames = columns.map(c => c.name);

        if (!columnNames.includes('reset_token')) {
            console.log('Adding reset_token column...');
            db.run("ALTER TABLE users ADD COLUMN reset_token TEXT", (err) => {
                if (err) console.error('Failed to add reset_token:', err.message);
                else console.log('Added reset_token');
            });
        } else {
            console.log('reset_token column already exists.');
        }

        if (!columnNames.includes('reset_token_expiry')) {
            console.log('Adding reset_token_expiry column...');
            db.run("ALTER TABLE users ADD COLUMN reset_token_expiry DATETIME", (err) => {
                if (err) console.error('Failed to add reset_token_expiry:', err.message);
                else console.log('Added reset_token_expiry');
            });
        } else {
            console.log('reset_token_expiry column already exists.');
        }

        // Also check if admin needs it? Yes, but user asked for "user forgot password".
        // Let's add for admins too just in case.
        db.all("PRAGMA table_info(admins)", (err, adminColumns) => {
            const adminColNames = adminColumns.map(c => c.name);

            if (!adminColNames.includes('reset_token')) {
                console.log('Adding reset_token to admins...');
                db.run("ALTER TABLE admins ADD COLUMN reset_token TEXT", (err) => {
                    if (err) console.error('Failed to add reset_token to admins:', err.message);
                });
            }

            if (!adminColNames.includes('reset_token_expiry')) {
                console.log('Adding reset_token_expiry to admins...');
                db.run("ALTER TABLE admins ADD COLUMN reset_token_expiry DATETIME", (err) => {
                    if (err) console.error('Failed to add reset_token_expiry to admins:', err.message);
                });
            }
        });
    });
});

setTimeout(() => {
    db.close();
    console.log('Migration complete.');
}, 2000);
