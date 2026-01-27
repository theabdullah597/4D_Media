const db = require('./database/db');
const path = require('path');

async function checkOrders() {
    try {
        await db.initializeDatabase();

        console.log('--- RECENT ORDERS ---');
        const orders = await db.all('SELECT id, order_number, status, created_at, total_amount FROM orders ORDER BY created_at DESC LIMIT 5');
        console.table(orders);

        if (orders.length > 0) {
            console.log('\n--- LATEST ORDER ITEMS ---');
            const items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [orders[0].id]);
            console.log(items);

            console.log('\n--- LATEST ORDER DESIGN ELEMENTS ---');
            // Check design elements for the first item of the latest order
            if (items.length > 0) {
                const elements = await db.all('SELECT * FROM design_elements WHERE order_item_id = ?', [items[0].id]);
                console.log(elements.map(e => ({ type: e.element_type, content: e.content })));
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

checkOrders();
