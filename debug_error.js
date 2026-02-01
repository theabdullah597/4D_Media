const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'backend', 'database', '4dmedia.db');
const db = new sqlite3.Database(dbPath);

async function testQuery() {
    try {
        console.log("Testing SQL query...");

        // Mock getting a product ID
        const product = await new Promise((resolve, reject) => {
            db.get("SELECT id, name FROM products LIMIT 1", (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!product) {
            console.log("No products found to test.");
            return;
        }

        console.log(`Testing with product: ${product.name} (ID: ${product.id})`);

        // Test the query I added
        const views = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM product_views WHERE product_id = ? ORDER BY is_default DESC', [product.id], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        console.log("Query successful!");
        console.log('Views:', views);

    } catch (error) {
        console.error("FATAL ERROR CAUSING 500:");
        console.error(error);
    } finally {
        db.close();
    }
}

testQuery();
