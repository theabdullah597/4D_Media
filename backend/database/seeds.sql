-- Master Seed Data for 4D Media (UK Custom Printing)

-- 1. Default Admin (Password: Admin@123)
INSERT INTO admins (username, password, email) VALUES 
('admin', '$2a$10$8K1p/a0dL3.Zy9GZJ5E7qe8Kx8kYz5n9s5VB7N3xC8F5D1P5Y0MJq', 'admin@4dmedia.com');

-- 2. Categories
INSERT INTO categories (name, slug, description) VALUES
('Apparel', 'apparel', 'Custom t-shirts, hoodies, and sweatshirts'),
('Drinkware', 'drinkware', 'Personalized mugs and water bottles'),
('Printed Materials', 'printed-materials', 'Business cards, flyers, and brochures'),
('Accessories', 'accessories', 'Custom caps, tote bags, and more');

-- 3. Products
INSERT INTO products (category_id, name, slug, description, base_price, printing_methods, is_active) VALUES
-- Apparel
(1, 'Essential Unisex T-Shirt', 'essential-unisex-tshirt', 'High-quality 100% organic cotton t-shirt', 14.99, 'DTG,DTF,Vinyl', 1),
(1, 'Premium Pullover Hoodie', 'premium-pullover-hoodie', 'Heavyweight fleece hoodie for maximum comfort', 29.99, 'DTF,Vinyl', 1),

-- Drinkware
(2, 'Classic Ceramic Mug 11oz', 'classic-ceramic-mug-11oz', 'Standard 11oz white ceramic mug', 8.99, 'Sublimation', 1),
(2, 'Large Ceramic Mug 15oz', 'large-ceramic-mug-15oz', 'Large 15oz mug for the extra caffeine', 10.99, 'Sublimation', 1),
(2, 'Magic Heat-Reveal Mug', 'magic-heat-reveal-mug', 'Black mug that reveals design when hot', 12.99, 'Sublimation', 1),

-- Printed Materials
(3, 'Premium Business Cards', 'premium-business-cards', '85x55mm high-quality business cards', 19.99, 'Digital Paper', 1),
(3, 'A5 Promotional Flyers', 'a5-promo-flyers', 'High gloss A5 flyers for your business', 24.99, 'Digital Paper', 1);

-- 4. Product Views (Defining multi-view designer positions)
-- T-Shirt Views
INSERT INTO product_views (product_id, view_name, image_url, is_default, print_area_json) VALUES
(1, 'Front', '/images/products/tshirt-front.png', 1, '{"x": 150, "y": 140, "width": 200, "height": 300, "mm_width": 250, "mm_height": 350}'),
(1, 'Back', '/images/products/tshirt-back.png', 0, '{"x": 150, "y": 120, "width": 200, "height": 320, "mm_width": 250, "mm_height": 400}'),
(1, 'Left Sleeve', '/images/products/tshirt-lsleeve.png', 0, '{"x": 200, "y": 200, "width": 80, "height": 80, "mm_width": 80, "mm_height": 80}'),
(1, 'Right Sleeve', '/images/products/tshirt-rsleeve.png', 0, '{"x": 200, "y": 200, "width": 80, "height": 80, "mm_width": 80, "mm_height": 80}');

-- Hoodie Views
INSERT INTO product_views (product_id, view_name, image_url, is_default, print_area_json) VALUES
(2, 'Front', '/images/products/hoodie-front.png', 1, '{"x": 160, "y": 180, "width": 180, "height": 180, "mm_width": 250, "mm_height": 250}'),
(2, 'Back', '/images/products/hoodie-back.png', 0, '{"x": 150, "y": 120, "width": 200, "height": 320, "mm_width": 250, "mm_height": 400}');

-- Mug Views
INSERT INTO product_views (product_id, view_name, image_url, is_default, print_area_json) VALUES
(3, 'Full Wrap', '/images/products/mug-wrap.png', 1, '{"x": 50, "y": 50, "width": 400, "height": 200, "mm_width": 190, "mm_height": 90}'),
(4, 'Body', '/images/products/large-mug-body.png', 1, '{"x": 60, "y": 60, "width": 380, "height": 280, "mm_width": 200, "mm_height": 100}'),
(5, 'Hidden View', '/images/products/magic-mug-hidden.png', 1, '{"x": 50, "y": 50, "width": 400, "height": 200, "mm_width": 190, "mm_height": 90}');

-- Printed Material Views
INSERT INTO product_views (product_id, view_name, image_url, is_default, print_area_json) VALUES
(6, 'Front', '/images/products/business-card-front.png', 1, '{"x": 0, "y": 0, "width": 500, "height": 300, "mm_width": 85, "mm_height": 55}'),
(6, 'Back', '/images/products/business-card-back.png', 0, '{"x": 0, "y": 0, "width": 500, "height": 300, "mm_width": 85, "mm_height": 55}'),
(7, 'Front', '/images/products/flyer-front.png', 1, '{"x": 0, "y": 0, "width": 420, "height": 595, "mm_width": 148, "mm_height": 210}');

-- 5. Product Variants (Sizes/Colors)
-- T-Shirt Variants (Treating Kids as Variants per Master Doc)
INSERT INTO product_variants (product_id, variant_type, variant_value, price_modifier) VALUES
(1, 'size', 'Kids 2-3', -2.00),
(1, 'size', 'Kids 4-5', -2.00),
(1, 'size', 'Kids 6-7', -2.00),
(1, 'size', 'Kids 8-9', -2.00),
(1, 'size', 'Adults S', 0.00),
(1, 'size', 'Adults M', 0.00),
(1, 'size', 'Adults L', 0.00),
(1, 'size', 'Adults XL', 1.50),
(1, 'size', 'Adults XXL', 2.50),
(1, 'color', 'White', 0.00),
(1, 'color', 'Black', 0.00),
(1, 'color', 'Navy', 0.00);

-- Printed Materials Quantity Slabs
INSERT INTO product_variants (product_id, variant_type, variant_value, price_modifier) VALUES
(6, 'quantity', '100', 0.00),
(6, 'quantity', '250', 15.00),
(6, 'quantity', '500', 35.00),
(6, 'quantity', '1000', 60.00);

-- 6. Bulk Price Tiers (10+ = 10% off, 50+ = 20% off)
INSERT INTO price_tiers (product_id, min_quantity, max_quantity, discount_percent) VALUES
(1, 11, 50, 10.00),
(1, 51, NULL, 20.00),
(2, 11, 50, 10.00),
(2, 51, NULL, 20.00),
(3, 11, 50, 10.00),
(3, 51, NULL, 20.00);
