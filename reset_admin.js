const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'backend/database/4dmedia.db');
const db = new sqlite3.Database(dbPath);

const password = 'Admin@123';

console.log(`Resetting admin password to: ${password}`);

bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('Error hashing password:', err);
        return;
    }

    console.log(`Generated Hash: ${hash}`);

    db.run(
        `UPDATE admins SET password = ? WHERE username = 'admin'`,
        [hash],
        function (err) {
            if (err) {
                console.error('Error updating DB:', err.message);
            } else {
                console.log(`Updated admin password. Rows affected: ${this.changes}`);

                // Verify
                db.get(`SELECT * FROM admins WHERE username = 'admin'`, (err, row) => {
                    console.log('Admin Record:', row);

                    // Double check verify
                    bcrypt.compare(password, row.password, (err, res) => {
                        console.log('Verification check:', res ? 'SUCCESS' : 'FAILED');
                    });
                });
            }
        }
    );
});
