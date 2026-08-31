-- ============================================================
--  migrate.sql — Nabaa Store DB Migration (safe to run multiple times)
--  Creates missing tables without destroying existing data
-- ============================================================

-- Create users table if missing
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT         NOT NULL,
    role          VARCHAR(50)  NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Create products table if missing
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

-- Create orders table if missing
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

-- Create order_items table if missing
CREATE TABLE IF NOT EXISTS order_items (
    id         SERIAL PRIMARY KEY,
    order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity   INTEGER NOT NULL CHECK (quantity > 0),
    price      DECIMAL(10, 2) NOT NULL
);

-- Indexes (safe to re-run)
CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_id      ON orders(user_id);

DO $$
BEGIN
  RAISE NOTICE '✅ Migration complete. Tables: users, products, orders, order_items ready.';
END $$;
