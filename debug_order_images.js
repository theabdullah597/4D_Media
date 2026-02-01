const db = require('./backend/database/db');
const fs = require('fs');
const path = require('path');
const config = require('./backend/config/config');

async function debugOrderImages() {
    try {
        console.log("--- DEBUGGING ORDER IMAGES ---");

        // 1. Get Latest Order
        const order = await db.get("SELECT * FROM orders ORDER BY created_at DESC LIMIT 1");
        if (!order) {
            console.log("No orders found.");
            return;
        }
        console.log(`Latest Order: ${order.order_number} (ID: ${order.id})`);

        // 2. Get Items
        const items = await db.all("SELECT * FROM order_items WHERE order_id = ?", [order.id]);

        for (const item of items) {
            console.log(`\nItem: ${item.product_name}`);

            // Check Variant Details (Mockup)
            const variants = JSON.parse(item.variant_details_json || '{}');
            console.log("  Variant Details (JSON):");
            console.log(JSON.stringify(variants, null, 2));

            if (variants.custom_preview) {
                console.log(`  -> Custom Preview URL: ${variants.custom_preview}`);
                // Verify if it points to a file we can find
                const filename = variants.custom_preview.split('/').pop();
                const filePath = path.join(__dirname, 'backend', 'uploads', filename);

                // Try alternate path (root uploads)
                const filePathRoot = path.join(__dirname, 'uploads', filename);

                if (fs.existsSync(filePath)) {
                    console.log(`     [OK] File exists at: backend/uploads/${filename}`);
                    console.log(`     Size: ${fs.statSync(filePath).size} bytes`);
                } else if (fs.existsSync(filePathRoot)) {
                    console.log(`     [OK] File exists at: uploads/${filename}`);
                    console.log(`     Size: ${fs.statSync(filePathRoot).size} bytes`);
                } else {
                    console.log(`     [FAIL] File NOT found at: ${filePath} OR ${filePathRoot}`);
                }
            }

            // Check Design Elements
            const elements = await db.all("SELECT * FROM design_elements WHERE order_item_id = ?", [item.id]);
            console.log(`  Design Elements (${elements.length}):`);

            for (const el of elements) {
                if (el.element_type === 'image') {
                    console.log(`    Image Path: ${el.content}`);
                    const filename = el.content.split('/').pop();
                    const filePath = path.join(__dirname, 'backend', 'uploads', filename);
                    const filePathRoot = path.join(__dirname, 'uploads', filename);

                    if (fs.existsSync(filePath)) {
                        console.log(`     [OK] File exists at: backend/uploads/${filename}`);
                    } else if (fs.existsSync(filePathRoot)) {
                        console.log(`     [OK] File exists at: uploads/${filename}`);
                    } else {
                        console.log(`     [FAIL] File NOT found.`);
                    }
                }
            }
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

debugOrderImages();
