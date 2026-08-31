// ============================================================
//  server.test.js — REST API Integration Tests (Jest + Supertest)
//  يختبر جميع endpoints لـ Nabaa Store API
// ============================================================

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { app, pool } = require('./server');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_in_prod';
const adminToken = jwt.sign({ id: 1, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

let createdProductId = null;

// ══════════════════════════════════════════════════════════
//  HEALTH CHECK
// ══════════════════════════════════════════════════════════
describe('✅ Health Check', () => {
  test('GET /health — يرجع status ok وبيانات الوقت', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('time');
    expect(res.body).toHaveProperty('version', '1.0.0');
  });

  test('GET /health — يرد في أقل من 3 ثوانٍ', async () => {
    const start = Date.now();
    await request(app).get('/health');
    expect(Date.now() - start).toBeLessThan(3000);
  });
});

// ══════════════════════════════════════════════════════════
//  GET ALL PRODUCTS
// ══════════════════════════════════════════════════════════
describe('📦 GET /api/products', () => {
  test('يُرجع مصفوفة من المنتجات', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('كل منتج يحتوي على الحقول المطلوبة', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    if (res.body.length > 0) {
      const product = res.body[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('category');
      expect(product).toHaveProperty('created_at');
    }
  });

  test('البحث بـ search يُصفّي النتائج', async () => {
    const res = await request(app).get('/api/products?search=Sony');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach(p => {
      const text = `${p.name} ${p.description || ''}`.toLowerCase();
      expect(text).toContain('sony');
    });
  });

  test('البحث بفئة category يُصفّي النتائج', async () => {
    const res = await request(app).get('/api/products?category=%D8%A5%D9%84%D9%83%D8%AA%D8%B1%D9%88%D9%8BD9%8A%D8%A7%D8%AA');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('بحث بكلمة غير موجودة يُرجع مصفوفة فارغة', async () => {
    const res = await request(app).get('/api/products?search=منتج_غير_موجود_12345xyz');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });
});

// ══════════════════════════════════════════════════════════
//  POST /api/products — إنشاء منتج جديد
// ══════════════════════════════════════════════════════════
describe('➕ POST /api/products', () => {
  const validProduct = {
    name: 'منتج اختبار تلقائي',
    price: 99.99,
    category: 'اختبار',
    description: 'هذا منتج أُنشئ بواسطة اختبار تلقائي',
    image: 'https://example.com/test.jpg',
  };

  test('ينشئ منتجاً جديداً بنجاح ويُرجع 201', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validProduct)
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(validProduct.name);
    expect(Number(res.body.price)).toBe(validProduct.price);
    expect(res.body.category).toBe(validProduct.category);

    createdProductId = res.body.id;
  });

  test('يرفض المنتج بدون اسم — 400', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 50, category: 'اختبار' })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('يرفض المنتج بدون فئة — 400', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'منتج', price: 50 })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('يرفض السعر السالب — 400', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'منتج', price: -10, category: 'اختبار' })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('يرفض السعر النصي — 400', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'منتج', price: 'سعر غير صالح', category: 'اختبار' })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('يقبل السعر صفر (0)', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'منتج مجاني', price: 0, category: 'اختبار' })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(201);
    expect(Number(res.body.price)).toBe(0);

    if (res.body.id) {
      await request(app)
        .delete(`/api/products/${res.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
    }
  });
});

// ══════════════════════════════════════════════════════════
//  GET /api/products/:id — جلب منتج واحد
// ══════════════════════════════════════════════════════════
describe('🔍 GET /api/products/:id', () => {
  test('يُرجع 404 لمنتج غير موجود', async () => {
    const res = await request(app).get('/api/products/999999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  test('يُرجع 400 لمعرّف غير صالح (نص)', async () => {
    const res = await request(app).get('/api/products/abc');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});

// ══════════════════════════════════════════════════════════
//  PUT /api/products/:id — تعديل منتج
// ══════════════════════════════════════════════════════════
describe('✏️ PUT /api/products/:id', () => {
  test('يُعدّل المنتج المُنشأ بنجاح', async () => {
    expect(createdProductId).not.toBeNull();

    const res = await request(app)
      .put(`/api/products/${createdProductId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'منتج اختبار مُعدَّل', price: 149.99 })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('منتج اختبار مُعدَّل');
    expect(Number(res.body.price)).toBe(149.99);
  });

  test('يُعدّل حقلاً واحداً فقط (partial update)', async () => {
    expect(createdProductId).not.toBeNull();

    const res = await request(app)
      .put(`/api/products/${createdProductId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ category: 'فئة جديدة' })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(200);
    expect(res.body.category).toBe('فئة جديدة');
    expect(res.body.name).toBe('منتج اختبار مُعدَّل');
  });

  test('يُرجع 404 عند تعديل منتج غير موجود', async () => {
    const res = await request(app)
      .put('/api/products/999999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'اسم جديد' })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(404);
  });

  test('يُرجع 400 لمعرّف غير صالح', async () => {
    const res = await request(app)
      .put('/api/products/abc')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'اسم' })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(400);
  });

  test('يرفض السعر السالب في التعديل', async () => {
    expect(createdProductId).not.toBeNull();

    const res = await request(app)
      .put(`/api/products/${createdProductId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: -50 })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(400);
  });
});

// ══════════════════════════════════════════════════════════
//  DELETE /api/products/:id — حذف منتج
// ══════════════════════════════════════════════════════════
describe('🗑️ DELETE /api/products/:id', () => {
  test('يحذف المنتج المُنشأ بنجاح ويُرجع رسالة', async () => {
    expect(createdProductId).not.toBeNull();

    const res = await request(app)
      .delete(`/api/products/${createdProductId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('product');
    expect(res.body.product.id).toBe(createdProductId);
  });

  test('يُرجع 404 عند حذف منتج غير موجود', async () => {
    const res = await request(app)
      .delete('/api/products/999999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
  });

  test('يُرجع 400 لمعرّف غير صالح', async () => {
    const res = await request(app)
      .delete('/api/products/xyz')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(400);
  });

  test('التحقق من الحذف الفعلي — 404 بعد الحذف', async () => {
    expect(createdProductId).not.toBeNull();
    const res = await request(app).get(`/api/products/${createdProductId}`);
    expect(res.statusCode).toBe(404);
  });
});

// ══════════════════════════════════════════════════════════
//  404 HANDLER
// ══════════════════════════════════════════════════════════
describe('🚫 404 Handler', () => {
  test('مسار غير موجود يُرجع 404 مع رسالة عربية', async () => {
    const res = await request(app).get('/api/nonexistent-route');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
  });
});

// ── Cleanup ───────────────────────────────────────────────
afterAll(async () => {
  await pool.end();
});
