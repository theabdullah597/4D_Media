-- 4D Media Master Database Schema
-- SQLite Database for Custom Printing Platform (UK Focused)

-- 1. Users (Mandatory Accounts)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    postcode TEXT, -- UK Postcode validation at app level
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Admin Users
CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Product Categories
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, -- Apparel, Drinkware, Accessories, Printed Materials
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Products
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL, -- In GBP (£)
    printing_methods TEXT, -- Comma-separated: 'DTF,DTG,Sublimation'
    is_active BOOLEAN DEFAULT 1,
    is_quote_only BOOLEAN DEFAULT 0, -- For Corporate/Bulk
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 5. Product Views (Front, Back, Sleeves, Full Wrap)
CREATE TABLE IF NOT EXISTS product_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    view_name TEXT NOT NULL, -- 'Front', 'Back', 'Left Sleeve', 'Right Sleeve', 'Full Wrap'
    image_url TEXT NOT NULL, -- Base mockup image
    mask_url TEXT, -- PNG mask for realistic coloring
    print_area_json TEXT, -- {x, y, width, height, mm_width, mm_height}
    is_default BOOLEAN DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 6. Product Variants (Sizes/Colors)
CREATE TABLE IF NOT EXISTS product_variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    variant_type TEXT NOT NULL, -- 'size' or 'color'
    variant_value TEXT NOT NULL, -- 'Kids 2-3', 'Adults S', 'Red', etc.
    price_modifier DECIMAL(10, 2) DEFAULT 0,
    stock_quantity INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT 1,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 7. Orders
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_city TEXT,
    delivery_postcode TEXT NOT NULL,
    order_notes TEXT,
    total_amount DECIMAL(10, 2) NOT NULL, -- In GBP (£)
    status TEXT DEFAULT 'new', -- new, in_production, printed, shipped, delivered, cancelled
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 8. Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    variant_details_json TEXT, -- JSON snapshot of size, color, name
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 9. Design Elements (Stored per VIEW)
CREATE TABLE IF NOT EXISTS design_elements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_item_id INTEGER NOT NULL,
    product_view_id INTEGER NOT NULL,
    element_type TEXT NOT NULL, -- 'image' or 'text'
    
    -- Design Data
    content TEXT, -- Text string or Image URL
    font_family TEXT,
    font_size INTEGER,
    color TEXT,
    
    -- Transforms
    position_x DECIMAL(10, 2),
    position_y DECIMAL(10, 2),
    rotation DECIMAL(10, 2) DEFAULT 0,
    scale_x DECIMAL(10, 2) DEFAULT 1,
    scale_y DECIMAL(10, 2) DEFAULT 1,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
    FOREIGN KEY (product_view_id) REFERENCES product_views(id)
);

-- 10. Price Tiers (Bulk Discounts)
CREATE TABLE IF NOT EXISTS price_tiers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    min_quantity INTEGER NOT NULL,
    max_quantity INTEGER, -- NULL means infinity
    discount_percent DECIMAL(5, 2) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_product_views_product ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_design_elements_view ON design_elements(product_view_id);
CREATE INDEX IF NOT EXISTS idx_price_tiers_product ON price_tiers(product_id);

