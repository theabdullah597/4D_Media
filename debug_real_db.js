const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Explicitly point to the LIVE database
const dbPath = path.join(__dirname, 'database', '4dmedia.db');
console.log(`Checking DB at: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
});

function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

async function debugRealData() {
    try {
        console.log("--- DEBUGGING REAL DATA ---");

        // 1. Latest Product
        const product = await get("SELECT * FROM products ORDER BY created_at DESC LIMIT 1");
        if (product) {
            console.log(`\nLATEST PRODUCT: ${product.name} (ID: ${product.id})`);
            console.log(`  Image URL: '${product.image_url}'`); // Quote to see whitespace

            // Check Views
            const views = await all("SELECT * FROM product_views WHERE product_id = ?", [product.id]);
            views.forEach(v => {
                console.log(`  View [${v.view_name}]: '${v.image_url}'`);
            });
        } else {
            console.log("\nNo products found.");
        }

        // 2. Latest Order
        const order = await get("SELECT * FROM orders ORDER BY created_at DESC LIMIT 1");
        if (order) {
            console.log(`\nLATEST ORDER: ${order.order_number} (ID: ${order.id})`);

            // Items
            const items = await all("SELECT * FROM order_items WHERE order_id = ?", [order.id]);
            for (const item of items) {
                console.log(`  Item: ${item.product_name}`);

                // Design Elements
                const els = await all("SELECT * FROM design_elements WHERE order_item_id = ?", [item.id]);
                if (els.length === 0) console.log("    No design elements.");
                els.forEach(el => {
                    console.log(`    Element [${el.element_type}]: '${el.content}'`);
                });
            }
        } else {
            console.log("\nNo orders found.");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        db.close();
    }
}

debugRealData();
