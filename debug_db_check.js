const db = require('./backend/database/db');
const fs = require('fs');
const path = require('path');

async function debugData() {
    try {
        console.log("--- DEBUGGING LATEST DATA ---");

        // 1. Latest Product
        const product = await db.get("SELECT * FROM products ORDER BY created_at DESC LIMIT 1");
        if (product) {
            console.log(`\nLATEST PRODUCT: ${product.name} (ID: ${product.id})`);
            console.log(`  Image URL: ${product.image_url}`);
            console.log(`  Is Active: ${product.is_active}`);

            // Check Views
            const views = await db.all("SELECT * FROM product_views WHERE product_id = ?", [product.id]);
            views.forEach(v => {
                console.log(`  View [${v.view_name}]: ${v.image_url} (Default: ${v.is_default})`);
            });
        } else {
            console.log("\nNo products found.");
        }

        // 2. Latest Order
        const order = await db.get("SELECT * FROM orders ORDER BY created_at DESC LIMIT 1");
        if (order) {
            console.log(`\nLATEST ORDER: ${order.order_number} (ID: ${order.id})`);

            // Items
            const items = await db.all("SELECT * FROM order_items WHERE order_id = ?", [order.id]);
            for (const item of items) {
                console.log(`  Item: ${item.product_name}`);
                const els = await db.all("SELECT * FROM design_elements WHERE order_item_id = ?", [item.id]);
                els.forEach(el => {
                    console.log(`    Element [${el.element_type}]: ${el.content}`);
                });
            }
        } else {
            console.log("\nNo orders found.");
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

debugData();
