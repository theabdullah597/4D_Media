const db = require('./database/db');
const config = require('./config/config');

async function debugOrder() {
    console.log('--- DEBUGGING ORDER CREATION WITH VALID IDS ---');

    try {
        const userId = 1;

        const customerName = "Test User";
        const customerEmail = "test@example.com";
        const customerPhone = "1234567890";
        const deliveryAddress = "123 Test St";
        const deliveryCity = "London";
        const deliveryPostcode = "SW1A 1AA";
        const orderNotes = undefined;
        const totalAmount = 29.99;
        const orderNumber = 'UK-DEBUG-' + Date.now();

        console.log('Step 1: Inserting Order...');
        const orderResult = await db.run(
            `INSERT INTO orders (
                order_number, user_id, customer_name, customer_email, customer_phone,
                delivery_address, delivery_city, delivery_postcode, order_notes,
                total_amount, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                orderNumber, userId, customerName, customerEmail, customerPhone,
                deliveryAddress, deliveryCity || null, deliveryPostcode, orderNotes || null,
                totalAmount, 'pending'
            ]
        );
        console.log('Order Inserted. ID:', orderResult.id);
        const orderId = orderResult.id;

        console.log('Step 2: Inserting Order Item...');
        const productId = 2; // "Premium Pullover Hoodie" (Active)
        const productName = "Premium Pullover Hoodie";
        const quantity = 1;
        const itemResult = await db.run(
            `INSERT INTO order_items (
                order_id, product_id, product_name, quantity,
                variant_details_json, unit_price, subtotal
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                orderId, productId, productName, quantity,
                JSON.stringify({ size: "L", color: "Black" }), 29.99, 29.99
            ]
        );
        console.log('Item Inserted. ID:', itemResult.id);
        const orderItemId = itemResult.id;

        console.log('Step 3: Inserting Design Element...');

        const element = {
            type: 'text',
            content: 'Hello World',
            fontFamily: 'Inter',
            fontSize: 24,
            color: '#000000',
            x: undefined,
            y: 100,
            rotation: 0,
            scaleX: 1,
            scaleY: 1
        };

        const viewId = 13; // "Front" view for Hoodie (Verified in DB)

        await db.run(
            `INSERT INTO design_elements (
                order_item_id, product_view_id, element_type,
                content, font_family, font_size, color,
                position_x, position_y, rotation, scale_x, scale_y
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                orderItemId, viewId, element.type,
                element.content || null, element.fontFamily || null, element.fontSize || null, element.color || null,
                element.x || 0,
                element.y || 0,
                element.rotation || 0,
                element.scaleX || 1, element.scaleY || 1
            ]
        );
        console.log('Design Element Inserted SUCCESSFULLY!');

    } catch (error) {
        console.error('CRASHED:', error);
    } finally {
        await db.close();
    }
}

debugOrder();
