const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql2/promise');
const path = require('path');
const config = require('./config/config');

const sqliteDbPath = path.join(__dirname, 'database/4dmedia.db');

async function migrate() {
    console.log('Starting migration from SQLite to MySQL...');
    console.log('SQLite DB:', sqliteDbPath);
    console.log('MySQL DB:', config.mysql.database);

    // 1. Connect to SQLite
    const sqliteDb = new sqlite3.Database(sqliteDbPath);

    // Promisify SQLite
    const sqliteAll = (sql, params = []) => {
        return new Promise((resolve, reject) => {
            sqliteDb.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    // 2. Connect to MySQL
    const mysqlPool = mysql.createPool({
        host: config.mysql.host,
        user: config.mysql.user,
        password: config.mysql.password,
        database: config.mysql.database,
        multipleStatements: true,
        namedPlaceholders: true
    });

    try {
        const connection = await mysqlPool.getConnection();

        // Disable foreign key checks for bulk insert
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        console.log('MySQL connected. Truncating existing tables...');
        // Order matters for truncation if we cared about FKs, but we disabled them
        const tables = [
            'design_elements', 'order_items', 'orders', 'price_tiers',
            'product_variants', 'product_views', 'products', 'categories',
            'admins', 'users'
        ];

        for (const table of tables) {
            try {
                await connection.query(`TRUNCATE TABLE ${table}`);
            } catch (e) {
                // Table might not exist yet if schema init hasn't run
                console.log(`Table ${table} might not exist or truncate failed: ${e.message}`);
            }
        }

        // Initialize Schema (force run it)
        console.log('Ensuring schema exists...');
        const fs = require('fs');
        const schemaPath = path.join(__dirname, 'database/schema_mysql.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await connection.query(schema);


        // --- MIGRATE DATA ---

        // 1. Users
        console.log('Migrating Users...');
        const users = await sqliteAll('SELECT * FROM users');
        for (const u of users) {
            await connection.execute(
                `INSERT INTO users (id, full_name, email, password, phone, address_line1, address_line2, city, postcode, reset_token, reset_token_expiry, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [u.id, u.full_name, u.email, u.password, u.phone, u.address_line1, u.address_line2, u.city, u.postcode, u.reset_token, u.reset_token_expiry, u.created_at, u.updated_at]
            );
        }
        console.log(`Migrated ${users.length} users.`);

        // 2. Admins
        console.log('Migrating Admins...');
        const admins = await sqliteAll('SELECT * FROM admins');
        for (const a of admins) {
            await connection.execute(
                `INSERT INTO admins (id, username, password, email, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [a.id, a.username, a.password, a.email, a.created_at, a.updated_at]
            );
        }
        console.log(`Migrated ${admins.length} admins.`);

        // 3. Categories
        console.log('Migrating Categories...');
        const cats = await sqliteAll('SELECT * FROM categories');
        for (const c of cats) {
            await connection.execute(
                `INSERT INTO categories (id, name, slug, description, created_at) 
                 VALUES (?, ?, ?, ?, ?)`,
                [c.id, c.name, c.slug, c.description, c.created_at]
            );
        }

        // 4. Products
        console.log('Migrating Products...');
        const products = await sqliteAll('SELECT * FROM products');
        for (const p of products) {
            await connection.execute(
                `INSERT INTO products (id, category_id, name, slug, description, base_price, printing_methods, is_active, is_quote_only, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [p.id, p.category_id, p.name, p.slug, p.description, p.base_price, p.printing_methods, p.is_active, p.is_quote_only, p.created_at, p.updated_at]
            );
        }

        // 5. Product Views
        console.log('Migrating Product Views...');
        const views = await sqliteAll('SELECT * FROM product_views');
        for (const v of views) {
            await connection.execute(
                `INSERT INTO product_views (id, product_id, view_name, image_url, mask_url, print_area_json, is_default) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [v.id, v.product_id, v.view_name, v.image_url, v.mask_url, v.print_area_json, v.is_default]
            );
        }

        // 6. Product Variants
        console.log('Migrating Variants...');
        const variants = await sqliteAll('SELECT * FROM product_variants');
        for (const v of variants) {
            await connection.execute(
                `INSERT INTO product_variants (id, product_id, variant_type, variant_value, price_modifier, stock_quantity, is_available) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [v.id, v.product_id, v.variant_type, v.variant_value, v.price_modifier, v.stock_quantity, v.is_available]
            );
        }

        // 7. Orders
        console.log('Migrating Orders...');
        const orders = await sqliteAll('SELECT * FROM orders');
        for (const o of orders) {
            await connection.execute(
                `INSERT INTO orders (id, order_number, user_id, customer_name, customer_email, customer_phone, delivery_address, delivery_city, delivery_postcode, order_notes, total_amount, status, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [o.id, o.order_number, o.user_id, o.customer_name, o.customer_email, o.customer_phone, o.delivery_address, o.delivery_city, o.delivery_postcode, o.order_notes, o.total_amount, o.status, o.created_at, o.updated_at]
            );
        }

        // 8. Order Items
        console.log('Migrating Order Items...');
        const items = await sqliteAll('SELECT * FROM order_items');
        for (const i of items) {
            await connection.execute(
                `INSERT INTO order_items (id, order_id, product_id, product_name, quantity, variant_details_json, unit_price, subtotal, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [i.id, i.order_id, i.product_id, i.product_name, i.quantity, i.variant_details_json, i.unit_price, i.subtotal, i.created_at]
            );
        }

        // 9. Design Elements
        console.log('Migrating Design Elements...');
        const elements = await sqliteAll('SELECT * FROM design_elements');
        for (const e of elements) {
            await connection.execute(
                `INSERT INTO design_elements (id, order_item_id, product_view_id, element_type, content, font_family, font_size, color, position_x, position_y, rotation, scale_x, scale_y, created_at) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [e.id, e.order_item_id, e.product_view_id, e.element_type, e.content, e.font_family, e.font_size, e.color, e.position_x, e.position_y, e.rotation, e.scale_x, e.scale_y, e.created_at]
            );
        }

        // 10. Price Tiers
        console.log('Migrating Price Tiers...');
        const tiers = await sqliteAll('SELECT * FROM price_tiers');
        for (const t of tiers) {
            await connection.execute(
                `INSERT INTO price_tiers (id, product_id, min_quantity, max_quantity, discount_percent) 
                 VALUES (?, ?, ?, ?, ?)`,
                [t.id, t.product_id, t.min_quantity, t.max_quantity, t.discount_percent]
            );
        }

        console.log('Migration completed successfully!');

        // Re-enable FK checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        connection.release();

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mysqlPool.end();
        sqliteDb.close();
    }
}

migrate();
