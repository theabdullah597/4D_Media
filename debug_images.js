const db = require('./backend/database/db');

async function checkOrderImages() {
    try {
        console.log("Checking orders...");

        // Just get all orders to see what's there (limit 5)
        const orders = await db.all("SELECT * FROM orders LIMIT 5");
        console.log(`Found ${orders.length} orders.`);

        if (orders.length > 0) {
            console.log("First order keys:", Object.keys(orders[0]));
            const order = orders[orders.length - 1]; // Last one
            console.log(`Latest Order ID: ${order.id} (${order.order_number})`);

            // Get items
            const items = await db.all("SELECT * FROM order_items WHERE order_id = ?", [order.id]);

            for (const item of items) {
                console.log(`  Item ID: ${item.id} - ${item.product_name}`);

                // Get design elements
                const elements = await db.all("SELECT * FROM design_elements WHERE order_item_id = ?", [item.id]);

                if (elements.length === 0) {
                    console.log("    No design elements found.");
                }

                for (const el of elements) {
                    console.log(`    Element [${el.element_type}]: ${el.content}`);
                }
            }
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

checkOrderImages();
