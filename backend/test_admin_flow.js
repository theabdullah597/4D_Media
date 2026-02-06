const db = require('./database/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Mock Config if variables missing
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

async function testAdminFlow() {
    console.log('--- TESTING ADMIN PASSWORD FLOW ---');

    try {
        // 1. Reset Admin to Known State
        console.log('Step 1: Resetting Admin...');
        const username = 'testadmin';
        const initialPassword = 'InitialPass1!';
        const newPassword = 'NewPass123!';

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(initialPassword, salt);

        // Ensure cleanup
        await db.run('DELETE FROM admins WHERE username = ?', [username]);

        const insertResult = await db.run(
            'INSERT INTO admins (username, password, email) VALUES (?, ?, ?)',
            [username, hashedPassword, 'test@admin.com']
        );
        const adminId = insertResult.id;
        console.log(`Admin created. ID: ${adminId}`);

        // 2. Login (Initial)
        console.log('Step 2: Attempting Initial Login...');
        const admin = await db.get('SELECT * FROM admins WHERE id = ?', [adminId]);
        const validPass = await bcrypt.compare(initialPassword, admin.password);
        console.log(`Password Match (Initial): ${validPass}`);

        if (!validPass) throw new Error('Initial password verification failed');

        // 3. Change Password (Simulation)
        console.log('Step 3: Changing Password...');
        // Simulate what the route does
        const newHashedPassword = await bcrypt.hash(newPassword, 10);

        // LOGIC CHECK: Update query
        const updateResult = await db.run('UPDATE admins SET password = ? WHERE id = ?', [newHashedPassword, adminId]);
        console.log(`Update Result: Changes = ${updateResult.changes}`);

        if (updateResult.changes === 0) throw new Error('Password update affected 0 rows');

        // 4. Login (New Password)
        console.log('Step 4: Attempting Login with NEW Password...');
        const updatedAdmin = await db.get('SELECT * FROM admins WHERE id = ?', [adminId]);

        console.log(`Old Hash: ${hashedPassword.substring(0, 10)}...`);
        console.log(`New Hash: ${updatedAdmin.password.substring(0, 10)}...`);

        const validNewPass = await bcrypt.compare(newPassword, updatedAdmin.password);
        console.log(`Password Match (New): ${validNewPass}`);

        if (!validNewPass) {
            console.error('FAILED: New password does not match stored hash.');
        } else {
            console.log('SUCCESS: Flow verified.');
        }

    } catch (error) {
        console.error('CRASHED:', error);
    } finally {
        // Cleanup
        await db.run('DELETE FROM admins WHERE username = ?', ['testadmin']);
        await db.close();
    }
}

testAdminFlow();
