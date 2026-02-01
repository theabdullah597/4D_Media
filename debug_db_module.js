const dbModule = require('./backend/database/db');

async function testDbModule() {
    try {
        console.log("Testing db module wrapper...");

        // Test get
        const product = await dbModule.get("SELECT id, name FROM products LIMIT 1");
        if (!product) {
            console.log("No product found.");
            return;
        }
        console.log(`Product found: ${product.name} (ID: ${product.id})`);

        // Test the problematic query using the wrapper
        console.log("Testing db.all for views...");
        const views = await dbModule.all('SELECT * FROM product_views WHERE product_id = ? ORDER BY is_default DESC', [product.id]);

        console.log("Query successful!");
        console.log('Views found:', views.length);
        console.log(views);

    } catch (err) {
        console.error("DB MODULE ERROR:");
        console.error(err);
    }
}

testDbModule();
