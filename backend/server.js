// ============================================================
//  server.js — Express REST API for Nabaa Store
//  Base URL: http://localhost:5000/api/products
// ============================================================

const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
if (process.env.ADMIN_URL) {
  allowedOrigins.push(process.env.ADMIN_URL);
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

// Test DB connection and run migrations if needed on startup
pool.connect()
  .then(async (client) => {
    console.log('✅ Connected to PostgreSQL database');
    try {
      // Check if products table exists
      const res = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'products'
        );
      `);
      if (!res.rows[0].exists) {
        console.log('📦 Products table not found. Running init.sql...');
        const initSqlPath = path.join(__dirname, 'init.sql');
        const initSql = fs.readFileSync(initSqlPath, 'utf8');
        await client.query(initSql);
        console.log('✅ Database initialization complete.');
      }
    } catch (err) {
      console.error('❌ Error during database initialization:', err.message);
    } finally {
      client.release();
    }
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

// ── JWT Secret & Default Admin ───────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_in_prod';
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

// ── Middleware: Authenticate Token ───────────────────────────
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'يرجى تسجيل الدخول' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'الجلسة منتهية، يرجى تسجيل الدخول مجدداً' });
    req.user = user;
    next();
  });
};

// ── Middleware: Require Admin ────────────────────────────────
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'غير مصرح لك بالقيام بهذا الإجراء' });
  }
  next();
};

// ── Seed Default Admin ───────────────────────────────────────
const seedAdmin = async () => {
  try {
    const adminCheck = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@nabaa.com']);
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
      await pool.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
        ['Admin', 'admin@nabaa.com', hashedPassword, 'admin']
      );
      console.log('✅ Default Admin created: admin@nabaa.com');
    }
  } catch (err) {
    console.error('❌ Error seeding admin:', err.message);
  }
};
seedAdmin();

// ══════════════════════════════════════════════════════════════
//  AUTH ROUTES
// ══════════════════════════════════════════════════════════════

app.post('/api/auth/register', asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
  }
  
  const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    return res.status(400).json({ message: 'البريد الإلكتروني مسجل مسبقاً' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, role',
    [name, email, hashedPassword]
  );
  
  const user = result.rows[0];
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  
  res.status(201).json({ user, token });
}));

app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token
  });
}));

app.get('/api/auth/me', authenticateToken, asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [req.user.id]);
  if (result.rows.length === 0) return res.status(404).json({ message: 'المستخدم غير موجود' });
  res.json(result.rows[0]);
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
app.post('/api/products', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
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
app.put('/api/products/:id', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
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
app.delete('/api/products/:id', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
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

// ══════════════════════════════════════════════════════════════
//  ORDERS ROUTES
// ══════════════════════════════════════════════════════════════

// POST /api/orders — إنشاء طلب جديد (للمستخدمين المسجلين)
app.post('/api/orders', authenticateToken, asyncHandler(async (req, res) => {
  const { name, phone, address, nearest_landmark, cart_items, total_amount } = req.body;
  
  if (!cart_items || cart_items.length === 0) {
    return res.status(400).json({ message: 'السلة فارغة' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const orderRes = await client.query(
      `INSERT INTO orders (user_id, name, phone, address, nearest_landmark, total_amount)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, name, phone, address, nearest_landmark || null, total_amount]
    );
    const order = orderRes.rows[0];

    for (const item of cart_items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.id, item.quantity, item.price]
      );
    }
    
    await client.query('COMMIT');
    res.status(201).json(order);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}));

// GET /api/orders/my-orders — جلب طلبيات المستخدم الحالي
app.get('/api/orders/my-orders', authenticateToken, asyncHandler(async (req, res) => {
  const result = await pool.query(`
    SELECT o.*, 
           json_agg(json_build_object('product_id', oi.product_id, 'quantity', oi.quantity, 'price', oi.price, 'name', p.name)) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = $1
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `, [req.user.id]);
  res.json(result.rows);
}));

// GET /api/orders — جلب جميع الطلبات (للأدمن)
app.get('/api/orders', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  const result = await pool.query(`
    SELECT o.*, 
           json_agg(json_build_object('product_id', oi.product_id, 'quantity', oi.quantity, 'price', oi.price, 'name', p.name)) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `);
  res.json(result.rows);
}));

// PUT /api/orders/:id/status — تحديث حالة الطلب (للأدمن)
app.put('/api/orders/:id/status', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  
  const result = await pool.query(
    'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [status, id]
  );
  
  if (result.rows.length === 0) return res.status(404).json({ message: 'الطلب غير موجود' });
  res.json(result.rows[0]);
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
