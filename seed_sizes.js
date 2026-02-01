const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', '4dmedia.db');
const db = new sqlite3.Database(dbPath);

const SIZES = ['Small', 'Medium', 'Large'];

function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function seed() {
    try {
        console.log(`Checking DB at: ${dbPath}`);
        const products = await all("SELECT id, name FROM products");
        console.log(`Found ${products.length} products.`);

        for (const product of products) {
            const variants = await all("SELECT * FROM product_variants WHERE product_id = ? AND variant_type = 'size'", [product.id]);

            if (variants.length === 0) {
                console.log(`  -> Adding sizes for ${product.name}`);
                for (const size of SIZES) {
                    await run("INSERT INTO product_variants (product_id, variant_type, variant_value, price_modifier) VALUES (?, ?, ?, ?)", [product.id, 'size', size, 0]);
                }
            } else {
                console.log(`  -> Sizes already exist for ${product.name}`);
            }
        }

        console.log("\nVerifying...");
        const rows = await all("SELECT * FROM product_variants WHERE variant_type='size'");
        console.log(`Total Size Variants in DB: ${rows.length}`);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        db.close();
    }
}

seed();
