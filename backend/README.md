# 🚀 Nabd Store — Backend API

REST API مبني بـ **Express.js + PostgreSQL** للمتجر الإلكتروني نبض ستور.

---

## 📁 هيكل الملفات

```
backend/
├── server.js           ← سيرفر Express + مسارات API
├── init.sql            ← إنشاء الجدول + بيانات تجريبية (16 منتج)
├── Dockerfile          ← صورة Docker للسيرفر
├── docker-compose.yml  ← تشغيل Node.js + PostgreSQL معاً
├── package.json
├── .env.example        ← قالب متغيرات البيئة
└── .dockerignore
```

---

## ⚡ الطريقة الأولى (الموصى بها): Docker Compose

> تشغيل Node.js + PostgreSQL بأمر **واحد فقط**

### المتطلبات
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) مثبت ويعمل

### أمر التشغيل
```bash
# من داخل مجلد backend/
docker compose up --build -d
```

### ماذا يحدث؟
1. 🐘 يُنشئ Container لـ PostgreSQL 16
2. 🔧 يُنفّذ `init.sql` تلقائياً (جدول + بيانات تجريبية)
3. 🚀 يبني ويشغّل سيرفر Node.js
4. ✅ API يعمل على `http://localhost:5000`

### أوامر مفيدة
```bash
# عرض حالة الـ Containers
docker compose ps

# عرض الـ Logs مباشرة
docker compose logs -f api
docker compose logs -f postgres

# إيقاف الكل
docker compose down

# إيقاف وحذف قاعدة البيانات (reset كامل)
docker compose down -v
```

---

## 🔧 الطريقة الثانية: تشغيل محلي

### 1. تثبيت PostgreSQL
```bash
# macOS (Homebrew)
brew install postgresql@16
brew services start postgresql@16

# أو استخدم PostgreSQL.app: https://postgresapp.com/
```

### 2. إنشاء قاعدة البيانات
```bash
psql -U postgres -c "CREATE DATABASE nabd_store;"
psql -U postgres -d nabd_store -f init.sql
```

### 3. إعداد متغيرات البيئة
```bash
cp .env.example .env
# عدّل .env إذا احتجت تغيير كلمة المرور
```

### 4. تشغيل السيرفر
```bash
npm install
npm start          # تشغيل عادي
# أو
npm run dev        # تشغيل مع nodemon (إعادة تشغيل تلقائي عند التعديل)
```

---

## 📋 مسارات الـ API

| الطريقة | المسار | الوصف |
|---------|--------|-------|
| `GET` | `/api/products` | جلب جميع المنتجات |
| `GET` | `/api/products/:id` | جلب منتج بالـ ID |
| `POST` | `/api/products` | إضافة منتج جديد |
| `PUT` | `/api/products/:id` | تعديل منتج |
| `DELETE` | `/api/products/:id` | حذف منتج |
| `GET` | `/health` | فحص صحة السيرفر |

### Query Parameters للـ GET /api/products
```
GET /api/products?search=سماعات
GET /api/products?category=إلكترونيات
GET /api/products?search=pro&category=إلكترونيات
```

### مثال POST /api/products
```json
{
  "name": "منتج جديد",
  "price": 99.99,
  "category": "إلكترونيات",
  "description": "وصف المنتج",
  "image": "https://example.com/image.jpg"
}
```

---

## 🌐 الـ Ports

| الخدمة | المنفذ |
|--------|--------|
| Node.js API | `5000` |
| PostgreSQL | `5432` |

---

## 🔗 الاتصال بالـ Frontend

الـ Frontend (React) على `http://localhost:5174` متصل بـ:
```
http://localhost:5000/api/products
```

تم ضبط CORS للسماح بالاتصال من المنافذ `5173` و `5174` و `3000`.
