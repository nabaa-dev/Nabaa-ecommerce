-- ============================================================
--  init.sql — Nabd Store Database Initialization
--  يتم تشغيل هذا الملف تلقائياً عند أول تشغيل للـ Container
-- ============================================================

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id          SERIAL PRIMARY KEY, 
    name        VARCHAR(255)   NOT NULL,
    price       DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    category    VARCHAR(100)   NOT NULL,
    description TEXT,
    image       TEXT,
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT         NOT NULL,
    role          VARCHAR(50)  NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id               SERIAL PRIMARY KEY,
    user_id          INTEGER NOT NULL REFERENCES users(id),
    name             VARCHAR(255) NOT NULL,
    phone            VARCHAR(50) NOT NULL,
    address          TEXT NOT NULL,
    nearest_landmark TEXT,
    total_amount     DECIMAL(10, 2) NOT NULL,
    status           VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id         SERIAL PRIMARY KEY,
    order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity   INTEGER NOT NULL CHECK (quantity > 0),
    price      DECIMAL(10, 2) NOT NULL
);

-- Index for faster searches
CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_id      ON orders(user_id);

-- ── Seed Data: بيانات تجريبية ────────────────────────────────
INSERT INTO products (name, price, category, description, image) VALUES

-- إلكترونيات
('سماعات Sony WH-1000XM5',           349.99, 'إلكترونيات',
 'سماعات لاسلكية احترافية مع خاصية إلغاء الضوضاء الرائدة في الصناعة',
 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500'),

('آيباد Pro 12.9 بوصة',               1099.00, 'إلكترونيات',
 'أقوى آيباد على الإطلاق مع شاشة Liquid Retina XDR ومعالج M2',
 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500'),

('ساعة Samsung Galaxy Watch 6',       299.00, 'إلكترونيات',
 'ساعة ذكية متقدمة مع مراقبة صحية شاملة وتصميم أنيق',
 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'),

('كاميرا Canon EOS R50',              679.00, 'إلكترونيات',
 'كاميرا مرايا بدون إطار خفيفة الوزن مثالية للمبدعين',
 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500'),

-- ملابس
('جاكيت جلدي فاخر للرجال',            189.99, 'ملابس',
 'جاكيت من الجلد الطبيعي بتصميم كلاسيكي عصري مناسب لكل المناسبات',
 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500'),

('فستان سهرة أنيق للسيدات',           129.00, 'ملابس',
 'فستان راقٍ من قماش الحرير مناسب للمناسبات الخاصة والحفلات',
 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500'),

('حذاء رياضي Nike Air Max',            149.00, 'ملابس',
 'حذاء رياضي مريح وعصري بتقنية Air Max للراحة القصوى طوال اليوم',
 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'),

-- أجهزة منزلية
('مكنسة كهربائية Dyson V15',          599.99, 'أجهزة منزلية',
 'مكنسة لاسلكية قوية مع تقنية الليزر لاكتشاف الغبار الخفي',
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'),

('قهوة Nespresso Vertuo Next',        179.00, 'أجهزة منزلية',
 'ماكينة قهوة ذكية تصنع مجموعة واسعة من المشروبات بضغطة واحدة',
 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500'),

('مكيف هواء بورتابل LG',              449.00, 'أجهزة منزلية',
 'مكيف هواء محمول بقدرة 12000 BTU مع تقنية التبريد السريع',
 'https://images.unsplash.com/photo-1631545806609-e0f26e1dc279?w=500'),

-- رياضة
('دراجة هوائية جبلية Trek',           899.00, 'رياضة',
 'دراجة جبلية احترافية بإطار ألومنيوم خفيف و21 سرعة للتضاريس الوعرة',
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'),

('حقيبة رياضية Adidas',               79.99,  'رياضة',
 'حقيبة رياضية واسعة مع مقصورات منظمة ومادة مقاومة للماء',
 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'),

-- كتب
('كتاب: فن الحرب',                    24.99,  'كتب',
 'الكتاب الاستراتيجي الخالد لسون تزو مع تفسيرات عصرية تطبيقية',
 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500'),

('كتاب: العقل الناجح',                19.99,  'كتب',
 'دليل شامل لتطوير العقلية الناجحة وتحقيق الأهداف الكبيرة',
 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500'),

-- جمال وعناية
('عطر Chanel No.5',                   220.00, 'جمال وعناية',
 'العطر الأسطوري الفرنسي الكلاسيكي بمزيج زهري فريد لا يُنسى',
 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=500'),

('مجموعة عناية بالبشرة La Mer',       350.00, 'جمال وعناية',
 'مجموعة متكاملة من كريمات الترطيب الفاخرة لبشرة متوهجة',
 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500');

-- Confirmation message
DO $$
BEGIN
  RAISE NOTICE '✅ Database initialized successfully with % products', (SELECT COUNT(*) FROM products);
END $$;
