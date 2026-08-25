import { useState, useEffect, useMemo } from 'react';
import { getAllProducts } from '../../services/api';
import ProductCard from '../ProductCard/ProductCard';
import { FilterIcon, RefreshIcon, PackageIcon } from '../Icons';
import './StoreFront.css';

const ALL_LABEL = 'الكل';

export default function StoreFront({ searchQuery }) {
  const [products, setProducts]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(ALL_LABEL);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء جلب المنتجات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category).filter(Boolean))];
    return [ALL_LABEL, ...cats];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery?.toLowerCase() || '';
      const matchesSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q);
      const matchesCategory =
        selectedCategory === ALL_LABEL || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  /* ── Loading Skeleton ─────────────────────────── */
  if (loading) {
    return (
      <div className="storefront">
        <div className="storefront__skeleton-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton skeleton--img" />
              <div className="skeleton skeleton--line" />
              <div className="skeleton skeleton--line skeleton--short" />
              <div className="skeleton skeleton--line skeleton--xs" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Error State ──────────────────────────────── */
  if (error) {
    return (
      <div className="storefront">
        <div className="storefront__error">
          <div className="storefront__error-icon">⚠️</div>
          <h2 className="storefront__error-title">تعذّر تحميل المنتجات</h2>
          <p className="storefront__error-msg">{error}</p>
          <button className="btn btn--primary" onClick={fetchProducts} id="retry-btn">
            <RefreshIcon size={16} />
            <span>إعادة المحاولة</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="storefront">
      {/* Hero */}
      <div className="storefront__hero">
        <div className="storefront__hero-content">
          <span className="storefront__hero-badge">🔥 عروض حصرية</span>
          <h1 className="storefront__hero-title">اكتشف أفضل المنتجات</h1>
          <p className="storefront__hero-subtitle">
            تسوق الآن من أرقى المجموعات بأسعار لا تُقاوم
          </p>
        </div>
        <div className="storefront__hero-shapes" aria-hidden="true">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="storefront__filters">
        <div className="storefront__filters-inner container">
          <div className="storefront__filter-label">
            <FilterIcon size={15} />
            <span>تصفية:</span>
          </div>
          <div className="storefront__categories" role="group" aria-label="Category filter">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`filter-${cat}`}
                className={`storefront__cat-btn ${selectedCategory === cat ? 'storefront__cat-btn--active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={selectedCategory === cat}
              >
                {cat}
              </button>
            ))}
          </div>
          <span className="storefront__count-badge">{filtered.length} منتج</span>
        </div>
      </div>

      {/* Product Grid */}
      <div className="container">
        {filtered.length === 0 ? (
          <div className="storefront__no-results">
            <PackageIcon size={64} className="storefront__no-results-icon" />
            <h3>لا توجد منتجات</h3>
            <p>جرّب تغيير مصطلح البحث أو الفئة المحددة</p>
            <button
              className="btn btn--ghost"
              onClick={() => setSelectedCategory(ALL_LABEL)}
            >
              عرض الكل
            </button>
          </div>
        ) : (
          <div className="product-grid" role="list" aria-label="Products">
            {filtered.map((product) => (
              <div key={product.id} role="listitem">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
