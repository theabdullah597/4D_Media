const mysql = require('mysql2/promise');
const config = require('./config/config');

async function checkTables() {
    console.log('--- CHECKING TABLES ---');
    const pool = mysql.createPool({
        host: config.mysql.host,
        user: config.mysql.user,
        password: config.mysql.password,
        database: config.mysql.database
    });

    try {
        const [products] = await pool.query('SELECT id, name FROM products LIMIT 5');
        console.log('Products:', products);

        const [views] = await pool.query('SELECT id, product_id, view_name FROM product_views LIMIT 5');
        console.log('Product Views:', views);

    } catch (error) {
        console.error('Check failed:', error);
    } finally {
        await pool.end();
    }
}

checkTables();
