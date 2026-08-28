// ============================================================
//  server.js — Express REST API for Nabaa Store
//  Base URL: http://localhost:5000/api/products
// ============================================================

const express = require('express');
const path = require('path');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── PostgreSQL Connection Pool ───────────────────────────────
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    }
  : {
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME     || 'nabaa_store',
      user:     process.env.DB_USER     || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres123',
    };

const pool = new Pool(poolConfig);

// Handle background errors to prevent server crash
pool.on('error', (err) => {
  console.error('🔴 Unexpected error on idle database client:', err.message);
});

// Test DB connection on startup (non-fatal)
pool.connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL database');
    client.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed at startup (continuing anyway):', err.message);
  });

// ── Helper: Async route wrapper ──────────────────────────────
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ── Health Check ─────────────────────────────────────────────
app.get('/health', asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT NOW() AS time');
  res.json({ status: 'ok', time: result.rows[0].time, version: '1.0.0' });
}));

// ══════════════════════════════════════════════════════════════
//  PRODUCTS ROUTES
// ══════════════════════════════════════════════════════════════

// GET /api/products — جلب جميع المنتجات
app.get('/api/products', asyncHandler(async (req, res) => {
  const { search, category } = req.query;

  let query = 'SELECT * FROM products';
  const params = [];
  const conditions = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(
      `(name ILIKE $${params.length} OR description ILIKE $${params.length})`
    );
  }

  if (category) {
    params.push(category);
    conditions.push(`category = $${params.length}`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY created_at DESC';

  const result = await pool.query(query, params);
  res.json(result.rows);
}));

// GET /api/products/:id — جلب منتج واحد
app.get('/api/products/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ message: 'معرّف المنتج غير صالح' });
  }

  const result = await pool.query(
    'SELECT * FROM products WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: 'المنتج غير موجود' });
  }

  res.json(result.rows[0]);
}));

// POST /api/products — إضافة منتج جديد
app.post('/api/products', asyncHandler(async (req, res) => {
  const { name, price, category, description, image } = req.body;

  // Validation
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'اسم المنتج مطلوب' });
  }
  if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
    return res.status(400).json({ message: 'السعر يجب أن يكون رقماً موجباً' });
  }
  if (!category || !category.trim()) {
    return res.status(400).json({ message: 'فئة المنتج مطلوبة' });
  }

  const result = await pool.query(
    `INSERT INTO products (name, price, category, description, image)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name.trim(), Number(price), category.trim(), description || null, image || null]
  );

  res.status(201).json(result.rows[0]);
}));

// PUT /api/products/:id — تعديل منتج
app.put('/api/products/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, price, category, description, image } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ message: 'معرّف المنتج غير صالح' });
  }

  // Check if product exists
  const existing = await pool.query('SELECT id FROM products WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    return res.status(404).json({ message: 'المنتج غير موجود' });
  }

  // Validation
  if (name !== undefined && !name.trim()) {
    return res.status(400).json({ message: 'اسم المنتج لا يمكن أن يكون فارغاً' });
  }
  if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) {
    return res.status(400).json({ message: 'السعر يجب أن يكون رقماً موجباً' });
  }

  const result = await pool.query(
    `UPDATE products
     SET
       name        = COALESCE($1, name),
       price       = COALESCE($2, price),
       category    = COALESCE($3, category),
       description = COALESCE($4, description),
       image       = COALESCE($5, image),
       updated_at  = NOW()
     WHERE id = $6
     RETURNING *`,
    [
      name?.trim()     ?? null,
      price !== undefined ? Number(price) : null,
      category?.trim() ?? null,
      description      ?? null,
      image            ?? null,
      id,
    ]
  );

  res.json(result.rows[0]);
}));

// DELETE /api/products/:id — حذف منتج
app.delete('/api/products/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ message: 'معرّف المنتج غير صالح' });
  }

  const result = await pool.query(
    'DELETE FROM products WHERE id = $1 RETURNING *',
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: 'المنتج غير موجود' });
  }

  res.json({ message: 'تم حذف المنتج بنجاح', product: result.rows[0] });
}));

// ── Serve React Static Files in Production ─────────────────
if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT) {
  const staticPath = path.join(__dirname, '../my-store/dist');
  app.use(express.static(staticPath));

  app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

// ── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `المسار ${req.originalUrl} غير موجود` });
});

// ── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('🔴 Server Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'حدث خطأ داخلي في السيرفر',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Nabaa Store API running on http://localhost:${PORT}`);
  console.log(`📋 Endpoints:`);
  console.log(`   GET    http://localhost:${PORT}/api/products`);
  console.log(`   POST   http://localhost:${PORT}/api/products`);
  console.log(`   PUT    http://localhost:${PORT}/api/products/:id`);
  console.log(`   DELETE http://localhost:${PORT}/api/products/:id`);
  console.log(`   GET    http://localhost:${PORT}/health`);
});
