const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const { authenticateAdmin, generateToken } = require('../middleware/auth');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const fs = require('fs');

/**
 * POST /api/admin/login
 * Admin login with username and password
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Get admin user
        const admin = await db.get('SELECT * FROM admins WHERE username = ?', [username]);

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(admin);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                admin: {
                    id: admin.id,
                    username: admin.username,
                    email: admin.email
                }
            }
        });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({
            success: false,
            message: 'Login error'
        });
    }
});

/**
 * PUT /api/admin/change-password
 * Change admin password
 */
router.put('/change-password', authenticateAdmin, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Validate strong password
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!strongPasswordRegex.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
            });
        }

        // Get admin to check current password
        const admin = await db.get('SELECT password FROM admins WHERE id = ?', [req.admin.id]);
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Incorrect current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.run('UPDATE admins SET password = ? WHERE id = ?', [hashedPassword, req.admin.id]);

        res.json({ success: true, message: 'Password updated successfully' });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * GET /api/admin/stats
 * Get dashboard statistics
 */
router.get('/stats', authenticateAdmin, async (req, res) => {
    console.log('GET /stats requested by admin');
    try {
        const totalOrders = await db.get('SELECT COUNT(*) as count FROM orders');
        const pendingOrders = await db.get("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'");
        const completedOrders = await db.get("SELECT COUNT(*) as count FROM orders WHERE status = 'completed'");
        const totalRevenue = await db.get('SELECT SUM(total_amount) as total FROM orders');

        res.json({
            success: true,
            data: {
                totalOrders: totalOrders.count || 0,
                pendingOrders: pendingOrders.count || 0,
                completedOrders: completedOrders.count || 0,
                totalRevenue: totalRevenue.total || 0
            }
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

/**
 * GET /api/admin/orders
 * Get all orders with optional filtering
 */
router.get('/orders', authenticateAdmin, async (req, res) => {
    try {
        const { status, startDate, endDate, limit = 50, offset = 0 } = req.query;

        let query = 'SELECT * FROM orders WHERE 1=1';
        const params = [];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        if (startDate) {
            query += ' AND created_at >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND created_at <= ?';
            params.push(endDate);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const orders = await db.all(query, params);

        // Get order items for each order
        for (const order of orders) {
            order.items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);

            // Get design elements with view names for each item
            for (const item of order.items) {
                item.designElements = await db.all(`
                    SELECT de.*, pv.view_name 
                    FROM design_elements de
                    LEFT JOIN product_views pv ON de.product_view_id = pv.id
                    WHERE de.order_item_id = ?
                `, [item.id]);
            }
        }

        res.json({
            success: true,
            data: orders
        });

    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders'
        });
    }
});

/**
 * GET /api/admin/orders/export
 * Export orders to CSV
 */
router.get('/orders/export', authenticateAdmin, async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;

        let query = 'SELECT * FROM orders WHERE 1=1';
        const params = [];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        if (startDate) {
            query += ' AND created_at >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND created_at <= ?';
            params.push(endDate);
        }

        query += ' ORDER BY created_at DESC';

        const orders = await db.all(query, params);

        // Create CSV
        const csvPath = path.join(__dirname, '../exports/orders-' + Date.now() + '.csv');
        const csvDir = path.dirname(csvPath);

        if (!fs.existsSync(csvDir)) {
            fs.mkdirSync(csvDir, { recursive: true });
        }

        const csvWriter = createObjectCsvWriter({
            path: csvPath,
            header: [
                { id: 'order_number', title: 'Order Number' },
                { id: 'customer_name', title: 'Customer Name' },
                { id: 'customer_email', title: 'Email' },
                { id: 'customer_phone', title: 'Phone' },
                { id: 'delivery_address', title: 'Address' },
                { id: 'total_amount', title: 'Total' },
                { id: 'status', title: 'Status' },
                { id: 'created_at', title: 'Order Date' }
            ]
        });

        await csvWriter.writeRecords(orders);

        // Send file
        res.download(csvPath, 'orders.csv', (err) => {
            // Delete file after download
            if (fs.existsSync(csvPath)) {
                fs.unlinkSync(csvPath);
            }
        });

    } catch (error) {
        console.error('Error exporting orders:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting orders'
        });
    }
});

/**
 * GET /api/admin/orders/:id
 * Get single order details
 */
router.get('/orders/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const order = await db.get('SELECT * FROM orders WHERE id = ?', [id]);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Get order items
        order.items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [id]);

        // Get design elements for each item
        for (const item of order.items) {
            item.designElements = await db.all('SELECT * FROM design_elements WHERE order_item_id = ?', [item.id]);
        }

        res.json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order'
        });
    }
});

/**
 * PUT /api/admin/orders/:id/status
 * Update order status
 */
router.put('/orders/:id/status', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }

        await db.run(
            'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, id]
        );

        res.json({
            success: true,
            message: 'Order status updated successfully'
        });

    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating order status'
        });
    }
});

/**
 * GET /api/admin/orders/export
 * Export orders to CSV
 */
router.get('/orders/export', authenticateAdmin, async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;

        let query = 'SELECT * FROM orders WHERE 1=1';
        const params = [];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        if (startDate) {
            query += ' AND created_at >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND created_at <= ?';
            params.push(endDate);
        }

        query += ' ORDER BY created_at DESC';

        const orders = await db.all(query, params);

        // Create CSV
        const csvPath = path.join(__dirname, '../exports/orders-' + Date.now() + '.csv');
        const csvDir = path.dirname(csvPath);

        if (!fs.existsSync(csvDir)) {
            fs.mkdirSync(csvDir, { recursive: true });
        }

        const csvWriter = createObjectCsvWriter({
            path: csvPath,
            header: [
                { id: 'order_number', title: 'Order Number' },
                { id: 'customer_name', title: 'Customer Name' },
                { id: 'customer_email', title: 'Email' },
                { id: 'customer_phone', title: 'Phone' },
                { id: 'delivery_address', title: 'Address' },
                { id: 'total_amount', title: 'Total' },
                { id: 'status', title: 'Status' },
                { id: 'created_at', title: 'Order Date' }
            ]
        });

        // Format dates before writing
        const formattedOrders = orders.map(order => ({
            ...order,
            created_at: new Date(order.created_at).toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        }));

        await csvWriter.writeRecords(formattedOrders);

        // Send file
        res.download(csvPath, 'orders.csv', (err) => {
            // Delete file after download
            if (fs.existsSync(csvPath)) {
                fs.unlinkSync(csvPath);
            }
        });

    } catch (error) {
        console.error('Error exporting orders:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting orders'
        });
    }
});

/**
 * GET /api/admin/products
 * Get all products (admin view)
 */
router.get('/products', authenticateAdmin, async (req, res) => {
    try {
        const products = await db.all(`
      SELECT p.*, c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);

        // Get variants and views for each product
        for (const product of products) {
            product.variants = await db.all('SELECT * FROM product_variants WHERE product_id = ?', [product.id]);
            product.views = await db.all('SELECT * FROM product_views WHERE product_id = ? ORDER BY is_default DESC', [product.id]);
        }

        res.json({
            success: true,
            data: products
        });

    } catch (error) {
        console.error('Error fetching products:', error);
        require('fs').writeFileSync('backend_error.log', String(error) + '\n' + error.stack);
        res.status(500).json({
            success: false,
            message: 'Error fetching products: ' + error.message
        });
    }
});

/**
 * POST /api/admin/products
 * Add new product
 */
const { upload, handleUploadError } = require('../middleware/upload');

/**
 * POST /api/admin/products
 * Add new product with Multi-View Support
 */
router.post('/products', authenticateAdmin, upload.any(), handleUploadError, async (req, res) => {
    try {
        const {
            categoryId,
            name,
            slug,
            description,
            basePrice,
            variants // JSON string if sent via FormData
        } = req.body;

        if (!categoryId || !name || !slug || !basePrice) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Ensure unique slug
        let itemSlug = slug;
        const existingProduct = await db.get('SELECT id FROM products WHERE slug = ?', [itemSlug]);
        if (existingProduct) {
            itemSlug = `${slug}-${Date.now()}`;
        }

        await db.beginTransaction();

        try {
            // 1. Determine Main Image
            // If explicit image_url provided (e.g. external link), use it.
            // Otherwise, use the first uploaded file as the main thumbnail.
            let mainImageUrl = req.body.imageUrl || '';

            if (!mainImageUrl && req.files && req.files.length > 0) {
                mainImageUrl = '/uploads/' + req.files[0].filename;
            }

            // 2. Insert Product
            const result = await db.run(
                `INSERT INTO products (category_id, name, slug, description, base_price, image_url)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [categoryId, name, itemSlug, description, basePrice, mainImageUrl]
            );

            const productId = result.id;

            // 3. Process Variants (expecting JSON string from FormData)
            let parsedVariants = [];
            if (variants) {
                try {
                    parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
                } catch (e) {
                    console.warn('Failed to parse variants JSON', e);
                }
            }

            if (Array.isArray(parsedVariants)) {
                for (const variant of parsedVariants) {
                    await db.run(
                        `INSERT INTO product_variants (product_id, variant_type, variant_value, price_modifier)
                         VALUES (?, ?, ?, ?)`,
                        [productId, variant.type, variant.value, variant.priceModifier || 0]
                    );
                }
            }

            // 4. Process Views (uploaded files or URL inputs or combined)
            const processedViews = new Set();

            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    let viewName = file.fieldname;
                    if (viewName.startsWith('view_')) viewName = viewName.replace('view_', '');
                    viewName = viewName.charAt(0).toUpperCase() + viewName.slice(1);
                    processedViews.add(viewName);

                    await db.run(
                        `INSERT INTO product_views (product_id, view_name, image_url, is_default, print_area_json)
                         VALUES (?, ?, ?, ?, ?)`,
                        [
                            productId,
                            viewName,
                            '/uploads/' + file.filename,
                            viewName === 'Front' ? 1 : 0,
                            '{"x": 150, "y": 150, "width": 200, "height": 300, "mm_width": 200, "mm_height": 300}'
                        ]
                    );
                }
            }

            // Check for manual URLs
            for (const key of Object.keys(req.body)) {
                if (key.startsWith('url_') && req.body[key]) {
                    let viewName = key.replace('url_', '');
                    // Normalize view name logic
                    if (viewName.toLowerCase() === 'front') viewName = 'Front';
                    if (viewName.toLowerCase() === 'back') viewName = 'Back';

                    if (!processedViews.has(viewName)) {
                        await db.run(
                            `INSERT INTO product_views (product_id, view_name, image_url, is_default, print_area_json)
                             VALUES (?, ?, ?, ?, ?)`,
                            [
                                productId,
                                viewName,
                                req.body[key], // Use the URL directly
                                viewName === 'Front' ? 1 : 0,
                                '{"x": 150, "y": 150, "width": 200, "height": 300, "mm_width": 200, "mm_height": 300}'
                            ]
                        );
                    }
                }
            }

            // Fallback if no views added at all
            const viewsCount = await db.get('SELECT COUNT(*) as count FROM product_views WHERE product_id = ?', [productId]);
            if (viewsCount.count === 0) {
                await db.run(
                    `INSERT INTO product_views (product_id, view_name, image_url, is_default, print_area_json)
                     VALUES (?, ?, ?, ?, ?)`,
                    [productId, 'Front', mainImageUrl || '/assets/placeholder-product.png', 1, '{"x": 150, "y": 150, "width": 200, "height": 300, "mm_width": 200, "mm_height": 300}']
                );
            }

            await db.commit();

            res.status(201).json({
                success: true,
                message: 'Product created with multi-view support',
                data: { productId }
            });

        } catch (error) {
            await db.rollback();
            throw error;
        }

    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({
            message: 'Error adding product: ' + error.message
        });
    }
});

/**
 * GET /api/admin/products/export
 * Export products to CSV
 */
router.get('/products/export', authenticateAdmin, async (req, res) => {
    try {
        const products = await db.all(`
            SELECT p.*, c.name as category_name
            FROM products p
            JOIN categories c ON p.category_id = c.id
            ORDER BY p.name ASC
        `);

        // Create CSV
        const csvPath = path.join(__dirname, '../exports/products-' + Date.now() + '.csv');
        const csvDir = path.dirname(csvPath);

        if (!fs.existsSync(csvDir)) {
            fs.mkdirSync(csvDir, { recursive: true });
        }

        const csvWriter = createObjectCsvWriter({
            path: csvPath,
            header: [
                { id: 'id', title: 'ID' },
                { id: 'name', title: 'Product Name' },
                { id: 'category_name', title: 'Category' },
                { id: 'base_price', title: 'Base Price' },
                { id: 'is_active', title: 'Active' },
                { id: 'slug', title: 'Slug' },
                { id: 'description', title: 'Description' }
            ]
        });

        await csvWriter.writeRecords(products);

        res.download(csvPath, 'products.csv', (err) => {
            if (fs.existsSync(csvPath)) {
                fs.unlinkSync(csvPath);
            }
        });

    } catch (error) {
        console.error('Error exporting products:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting products'
        });
    }
});

/**
 * PUT /api/admin/products/:id
 * Update product
 */
router.put('/products/:id', authenticateAdmin, upload.any(), handleUploadError, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            categoryId,
            name,
            slug,
            description,
            basePrice,
            isActive
        } = req.body;

        await db.beginTransaction();

        try {
            // Ensure unique slug (excluding current product)
            let itemSlug = slug;
            const existingProduct = await db.get('SELECT id FROM products WHERE slug = ? AND id != ?', [itemSlug, id]);
            if (existingProduct) {
                itemSlug = `${slug}-${Date.now()}`;
            }

            // 1. Process Main Image
            let mainImageUrl = req.body.imageUrl;

            // If new file uploaded for explicit 'main' or just first file if not specified
            if (req.files && req.files.length > 0) {
                const frontFile = req.files.find(f => f.fieldname === 'Front' || f.fieldname === 'view_Front');
                if (frontFile) {
                    mainImageUrl = '/uploads/' + frontFile.filename;
                } else if (!mainImageUrl && req.files[0]) {
                    mainImageUrl = '/uploads/' + req.files[0].filename;
                }
            }

            // Check if Main Image (Front URL) changed via manual input
            if (req.body['url_Front']) {
                mainImageUrl = req.body['url_Front'];
            }

            await db.run(
                `UPDATE products 
                SET category_id = ?, name = ?, slug = ?, description = ?, 
                    base_price = ?, image_url = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
                [categoryId, name, itemSlug, description, basePrice, mainImageUrl, isActive ? 1 : 0, id]
            );

            // 2. Handle Deletions
            if (req.body.deletedViews) {
                try {
                    const viewsToDelete = JSON.parse(req.body.deletedViews);
                    if (Array.isArray(viewsToDelete) && viewsToDelete.length > 0) {
                        for (const viewName of viewsToDelete) {
                            // Normalize
                            let vName = viewName;
                            if (vName === 'Front') vName = 'Front'; // keep consistency

                            await db.run('DELETE FROM product_views WHERE product_id = ? AND view_name = ?', [id, vName]);

                            // If we deleted the Front view, we might want to clear the main image if it matches? 
                            // But usually main image stays as fallback. We leave it.
                        }
                    }
                } catch (e) {
                    console.warn("Error parsing deletedViews", e);
                }
            }

            // 3. Process Views (Updates/Inserts)
            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    let viewName = file.fieldname;
                    if (viewName.startsWith('view_')) viewName = viewName.replace('view_', '');
                    viewName = viewName.charAt(0).toUpperCase() + viewName.slice(1);

                    // Check if view exists
                    const existingView = await db.get('SELECT * FROM product_views WHERE product_id = ? AND view_name = ?', [id, viewName]);

                    if (existingView) {
                        await db.run(
                            'UPDATE product_views SET image_url = ? WHERE id = ?',
                            ['/uploads/' + file.filename, existingView.id]
                        );
                    } else {
                        await db.run(
                            `INSERT INTO product_views (product_id, view_name, image_url, is_default, print_area_json)
                             VALUES (?, ?, ?, ?, ?)`,
                            [
                                id,
                                viewName,
                                '/uploads/' + file.filename,
                                viewName === 'Front' ? 1 : 0,
                                '{"x": 150, "y": 150, "width": 200, "height": 300, "mm_width": 200, "mm_height": 300}'
                            ]
                        );
                    }
                }
            }

            // Allow updating via URL too
            for (const key of Object.keys(req.body)) {
                if (key.startsWith('url_') && req.body[key]) {
                    let viewName = key.replace('url_', '');
                    if (viewName.toLowerCase() === 'front') viewName = 'Front';
                    if (viewName.toLowerCase() === 'back') viewName = 'Back';

                    const existingView = await db.get('SELECT * FROM product_views WHERE product_id = ? AND view_name = ?', [id, viewName]);
                    if (existingView) {
                        await db.run(
                            'UPDATE product_views SET image_url = ? WHERE id = ?',
                            [req.body[key], existingView.id]
                        );
                    } else {
                        await db.run(
                            `INSERT INTO product_views (product_id, view_name, image_url, is_default, print_area_json)
                             VALUES (?, ?, ?, ?, ?)`,
                            [
                                id,
                                viewName,
                                req.body[key],
                                viewName === 'Front' ? 1 : 0,
                                '{"x": 150, "y": 150, "width": 200, "height": 300, "mm_width": 200, "mm_height": 300}'
                            ]
                        );
                    }

                    // If Front view is updated via URL, update main product image
                    if (viewName === 'Front') {
                        await db.run(
                            'UPDATE products SET image_url = ? WHERE id = ?',
                            [req.body[key], id]
                        );
                    }
                }
            }

            await db.commit();

            res.json({
                success: true,
                message: 'Product updated successfully'
            });
        } catch (error) {
            await db.rollback();
            throw error;
        }

    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            message: 'Error updating product: ' + error.message
        });
    }
});

/**
 * DELETE /api/admin/products/:id
 * Delete product
 */
router.delete('/products/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if product is in any orders
        const ordersCheck = await db.get('SELECT COUNT(*) as count FROM order_items WHERE product_id = ?', [id]);
        if (ordersCheck.count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete product associated with existing orders. Please mark it as inactive (Archive) instead.'
            });
        }

        await db.beginTransaction();

        try {
            // Delete related data first (Manual Cascade)
            // 1. Delete orphan design elements if any (safe cleanup)
            await db.run('DELETE FROM design_elements WHERE product_view_id IN (SELECT id FROM product_views WHERE product_id = ?)', [id]);

            // 2. Delete views, variants, tiers
            await db.run('DELETE FROM product_views WHERE product_id = ?', [id]);
            await db.run('DELETE FROM product_variants WHERE product_id = ?', [id]);
            await db.run('DELETE FROM price_tiers WHERE product_id = ?', [id]);

            // 3. Delete product
            await db.run('DELETE FROM products WHERE id = ?', [id]);

            await db.commit();

            res.json({
                success: true,
                message: 'Product deleted successfully'
            });
        } catch (error) {
            await db.rollback();
            throw error;
        }

    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error deleting product'
        });
    }
});

/**
 * DELETE /api/admin/orders/:id
 * Permanently delete an order and its data
 */
router.delete('/orders/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        await db.beginTransaction();

        try {
            // Manual cleanups to ensure database size reduction even if FK cascade is off
            // 1. Get order items to find design elements
            const items = await db.all('SELECT id FROM order_items WHERE order_id = ?', [id]);

            for (const item of items) {
                await db.run('DELETE FROM design_elements WHERE order_item_id = ?', [item.id]);
            }

            // 2. Delete items
            await db.run('DELETE FROM order_items WHERE order_id = ?', [id]);

            // 3. Delete order
            await db.run('DELETE FROM orders WHERE id = ?', [id]);

            await db.commit();

            res.json({
                success: true,
                message: 'Order deleted successfully'
            });
        } catch (error) {
            await db.rollback();
            throw error;
        }

    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting order: ' + error.message
        });
    }
});

/**
 * GET /api/admin/analytics/revenue
 * Get revenue over time
 */
router.get('/analytics/revenue', authenticateAdmin, async (req, res) => {
    try {
        const revenueData = await db.all(`
            SELECT strftime('%Y-%m-%d', created_at) as date, SUM(total_amount) as revenue
            FROM orders
            WHERE status != 'cancelled'
            GROUP BY date
            ORDER BY date ASC
            LIMIT 30
        `);

        res.json({ success: true, data: revenueData });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching revenue analytics' });
    }
});

/**
 * GET /api/admin/analytics/products
 * Get top selling products
 */
router.get('/analytics/products', authenticateAdmin, async (req, res) => {
    try {
        const productData = await db.all(`
            SELECT product_name, SUM(quantity) as quantity, SUM(subtotal) as total_revenue
            FROM order_items
            GROUP BY product_name
            ORDER BY quantity DESC
            LIMIT 10
        `);

        res.json({ success: true, data: productData });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching product analytics' });
    }
});

module.exports = router;
