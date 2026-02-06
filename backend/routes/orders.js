const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { upload, handleUploadError } = require('../middleware/upload');
const { sendOrderNotification } = require('../utils/email');
const authUser = require('../middleware/auth_user');
const config = require('../config/config');

// UK Postcode Validation Regex
// Relaxed UK Postcode Validation Regex (Allows generic formats)
const UK_POSTCODE_REGEX = /^[A-Za-z0-9][A-Za-z0-9\s]{2,8}[A-Za-z0-9]$/;

/**
 * POST /api/orders
 * Create a new order (Authenticated Users ONLY)
 */
router.post('/', authUser, upload.fields([{ name: 'designImages', maxCount: 20 }, { name: 'previewImage', maxCount: 1 }]), handleUploadError, async (req, res) => {
    try {
        console.log('--- NEW ORDER REQUEST ---');
        console.log('Headers Content-Type:', req.headers['content-type']);
        console.log('req.files:', req.files);
        console.log('req.body keys:', Object.keys(req.body));

        const {
            customerName,
            customerEmail,
            customerPhone,
            deliveryAddress,
            deliveryCity,
            deliveryPostcode,
            orderNotes,
            items // JSON string
        } = req.body;

        const userId = req.user.id;

        // UK Address Validation
        if (!UK_POSTCODE_REGEX.test(deliveryPostcode)) {
            return res.status(400).json({ success: false, message: 'Invalid UK Postcode' });
        }

        if (!customerName || !customerEmail || !customerPhone || !deliveryAddress || !items) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        let parsedItems;
        try {
            parsedItems = JSON.parse(items);
        } catch (error) {
            return res.status(400).json({ success: false, message: 'Invalid items format' });
        }

        // Generate ID
        const orderNumber = 'UK-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 1000);

        // Calculate secure total with bulk discounts
        let totalAmount = 0;
        for (const item of parsedItems) {
            const tier = await db.get(
                'SELECT discount_percent FROM price_tiers WHERE product_id = ? AND min_quantity <= ? AND (max_quantity >= ? OR max_quantity IS NULL)',
                [item.productId, item.quantity, item.quantity]
            );

            const discount = tier ? (parseFloat(tier.discount_percent) / 100) : 0;
            const unitPrice = parseFloat(item.unitPrice);
            item.calculatedUnitPrice = unitPrice * (1 - discount);
            item.calculatedSubtotal = item.calculatedUnitPrice * (item.quantity || 1);
            totalAmount += item.calculatedSubtotal;
        }

        await db.beginTransaction();

        try {
            // 1. Insert Order
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

            const orderId = orderResult.id;

            // Handle Files (Safe Access)
            const files = req.files || {};
            const uploadedDesignFiles = files['designImages'] || [];
            const previewFile = files['previewImage'] ? files['previewImage'][0] : null;

            const uploadedImageUrls = uploadedDesignFiles.map(f => `${config.frontendUrl}/uploads/${f.filename}`);
            if (previewFile) {
                uploadedImageUrls.push(`${config.frontendUrl}/uploads/${previewFile.filename}`);
            }

            let fileIndex = 0;

            // 2. Insert Items & Designs
            for (const item of parsedItems) {
                // Attach preview image to variant details
                if (previewFile) {
                    item.variantDetails = item.variantDetails || {};
                    item.variantDetails.custom_preview = `${config.frontendUrl}/uploads/${previewFile.filename}`;
                }

                const itemResult = await db.run(
                    `INSERT INTO order_items (
                        order_id, product_id, product_name, quantity,
                        variant_details_json, unit_price, subtotal
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        orderId, item.productId, item.productName || 'Custom Product', item.quantity || 1,
                        JSON.stringify(item.variantDetails || {}), item.calculatedUnitPrice, item.calculatedSubtotal
                    ]
                );

                const orderItemId = itemResult.id;

                // Design elements grouped by VIEW
                if (item.views && Array.isArray(item.views)) {
                    for (const view of item.views) {
                        for (const element of view.elements) {
                            let content = element.content;

                            if (element.type === 'image' && element.source === 'upload') {
                                const file = uploadedDesignFiles[fileIndex++];
                                content = file ? '/uploads/' + file.filename : content;
                            }

                            await db.run(
                                `INSERT INTO design_elements (
                                    order_item_id, product_view_id, element_type,
                                    content, font_family, font_size, color,
                                    position_x, position_y, rotation, scale_x, scale_y
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                [
                                    orderItemId, view.viewId, element.type,
                                    content || null, element.fontFamily || null, element.fontSize || null, element.color || null,
                                    element.x || 0, element.y || 0, element.rotation || 0,
                                    element.scaleX || 1, element.scaleY || 1
                                ]
                            );
                        }
                    }
                }
            }

            await db.commit();

            // Notify admin via email
            // const order = await db.get('SELECT * FROM orders WHERE id = ?', [orderId]);
            // const oItems = await db.all('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
            // sendOrderNotification(order, oItems).catch(console.error);

            res.status(201).json({
                success: true,
                data: { orderId, orderNumber, totalAmount: totalAmount.toFixed(2), designs: uploadedImageUrls }
            });

        } catch (error) {
            await db.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Order creation error:', error);
        // Log to file for debugging
        const fs = require('fs');
        const logMessage = `[${new Date().toISOString()}] Order Error: ${error.message}\nStack: ${error.stack}\n\n`;
        fs.appendFileSync('backend_error.log', logMessage);

        res.status(500).json({ success: false, message: 'Internal server error: ' + error.message });
    }
});

/**
 * POST /api/orders/:id/whatsapp
 * Unchanged apart from currency symbol logic in future UI
 */
router.post('/:id/whatsapp', async (req, res) => {
    try {
        const { id } = req.params;
        const order = await db.get('SELECT * FROM orders WHERE id = ?', [id]);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        const orderItems = await db.all('SELECT * FROM order_items WHERE order_id = ?', [id]);

        let message = `*New Order from 4D Media (UK)*\n\n`;
        message += `Order Number: ${order.order_number}\n`;
        message += `Customer: ${order.customer_name}\n`;
        message += `Phone: ${order.customer_phone}\n`;
        message += `Delivery: ${order.delivery_address}, ${order.delivery_postcode}\n`;
        message += `Total: £${parseFloat(order.total_amount).toFixed(2)}\n\n`;
        message += `*Items:*\n`;

        orderItems.forEach((item, index) => {
            const variants = JSON.parse(item.variant_details_json || '{}');
            message += `${index + 1}. ${item.product_name} - Qty: ${item.quantity}\n`;
            if (variants.size) message += `   Size: ${variants.size}\n`;
            if (variants.color) message += `   Color: ${variants.color}\n`;

            // Add Design Link
            if (variants.custom_preview) {
                message += `   🎨 *View Design:* ${variants.custom_preview}\n`;
            }
            message += `\n`;
        });

        message += `_Please process this order immediately._`;

        const encodedMessage = encodeURIComponent(message);
        res.json({ success: true, data: { whatsappUrl: `https://wa.me/${config.whatsappNumber}?text=${encodedMessage}` } });
    } catch (error) {
        console.error("WhatsApp Error:", error);
        // Log to file for debugging
        const fs = require('fs');
        const logMessage = `[${new Date().toISOString()}] WhatsApp Error: ${error.message}\nStack: ${error.stack}\n\n`;
        fs.appendFileSync('backend_error.log', logMessage);

        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;

