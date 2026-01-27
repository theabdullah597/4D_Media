const express = require('express');
const router = express.Router();
const db = require('../database/db');

/**
 * GET /api/categories
 * Get all product categories
 */
router.get('/categories', async (req, res) => {
    try {
        const categories = await db.all('SELECT * FROM categories ORDER BY name');

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories'
        });
    }
});

/**
 * GET /api/products
 * Get all active products with their primary info
 */
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;

        let query = `
            SELECT p.*, c.name as category_name, c.slug as category_slug,
            (SELECT image_url FROM product_views WHERE product_id = p.id AND is_default = 1) as image_url
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = 1
        `;

        const params = [];

        if (category) {
            query += ' AND c.slug = ?';
            params.push(category);
        }

        query += ' ORDER BY p.created_at DESC';

        const products = await db.all(query, params);

        // Fetch views for each product to support carousel
        for (const product of products) {
            product.views = await db.all('SELECT * FROM product_views WHERE product_id = ? ORDER BY is_default DESC', [product.id]);
        }

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products'
        });
    }
});

/**
 * GET /api/products/:id
 * Get single product with full views and variants
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const product = await db.get(
            `SELECT p.*, c.name as category_name, c.slug as category_slug
             FROM products p
             JOIN categories c ON p.category_id = c.id
             WHERE p.id = ? AND p.is_active = 1`,
            [id]
        );

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Get views
        // Get views ordered by default first
        const views = await db.all('SELECT * FROM product_views WHERE product_id = ? ORDER BY is_default DESC', [id]);
        product.views = views;

        // Get variants
        const variants = await db.all(
            'SELECT * FROM product_variants WHERE product_id = ? AND is_available = 1',
            [id]
        );

        product.sizes = variants.filter(v => v.variant_type === 'size');
        product.colors = variants.filter(v => v.variant_type === 'color');
        product.quantities = variants.filter(v => v.variant_type === 'quantity');

        // Get bulk price tiers
        product.price_tiers = await db.all(
            'SELECT * FROM price_tiers WHERE product_id = ? ORDER BY min_quantity ASC',
            [id]
        );

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
