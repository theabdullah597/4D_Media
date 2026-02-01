const jwt = require('jsonwebtoken');
const config = require('./backend/config/config');

// Manually load env if needed, but config usually does it.
// We'll read .env manually just in case config doesn't pick it up in this script context
require('dotenv').config({ path: './backend/.env' });

const SECRET = process.env.JWT_SECRET || config.jwtSecret;
const API_URL = 'http://localhost:5000/api/admin/products';

console.log('Using Secret:', SECRET);

const token = jwt.sign(
    {
        id: 1,
        username: 'admin',
        email: 'admin@4dmedia.com'
    },
    SECRET,
    { expiresIn: '1h' }
);

console.log('Generated Token:', token);

async function testApi() {
    try {
        console.log(`Fetching ${API_URL}...`);
        const res = await fetch(API_URL, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Response:', text.substring(0, 500)); // Log first 500 chars

    } catch (err) {
        console.error('Fetch Error:', err);
    }
}

testApi();
