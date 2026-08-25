import { useState, useEffect, useCallback } from 'react';
import { getAllProducts, deleteProduct } from '../../services/api';
import ProductModal from '../ProductModal/ProductModal';
import {
  PlusIcon, EditIcon, TrashIcon, PackageIcon,
  TrendingUpIcon, DollarSignIcon, RefreshIcon, ImageIcon, TagIcon,
} from '../Icons';
import './AdminDashboard.css';

function StatCard({ icon, label, value, color, subtitle }) {
  return (
    <div className="stat-card" style={{ '--stat-color': color }}>
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__body">
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{value}</p>
        {subtitle && <p className="stat-card__subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}

function DeleteConfirmModal({ product, onConfirm, onCancel }) {
  if (!product) return null;
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
      <div className="modal modal--sm">
        <div className="modal__header">
          <h2 className="modal__title" id="delete-modal-title">تأكيد الحذف</h2>
        </div>
        <div className="modal__body">
          <div className="delete-modal__icon">🗑️</div>
          <p className="delete-modal__text">
            هل أنت متأكد من حذف المنتج <strong>"{product.name}"</strong>؟
          </p>
          <p className="delete-modal__warning">هذا الإجراء لا يمكن التراجع عنه.</p>
        </div>
        <div className="modal__actions">
          <button className="btn btn--ghost" onClick={onCancel}>إلغاء</button>
          <button id="confirm-delete-btn" className="btn btn--danger" onClick={onConfirm}>
            <TrashIcon size={16} />
            <span>حذف نهائي</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard({ onToast }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchAdmin, setSearchAdmin] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'تعذّر جلب المنتجات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      onToast(`تم حذف "${deleteTarget.name}" بنجاح`, 'success');
    } catch (err) {
      onToast(err.message || 'فشل حذف المنتج', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleModalSuccess = (msg, type) => {
    onToast(msg, type);
    fetchProducts();
  };

  const totalRevenue = products.reduce((acc, p) => acc + Number(p.price || 0), 0);
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

  const filtered = products.filter((p) =>
    !searchAdmin ||
    p.name?.toLowerCase().includes(searchAdmin.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchAdmin.toLowerCase())
  );

  return (
    <section className="admin">
      {/* Stats Row */}
      <div className="admin__stats container">
        <StatCard
          icon={<PackageIcon size={24} />}
          label="إجمالي المنتجات"
          value={products.length}
          color="#14b8a6"
          subtitle="منتج مضاف"
        />
        <StatCard
          icon={<DollarSignIcon size={24} />}
          label="إجمالي القيمة"
          value={`$${totalRevenue.toFixed(2)}`}
          color="#38bdf8"
          subtitle="القيمة الإجمالية للمخزون"
        />
        <StatCard
          icon={<TrendingUpIcon size={24} />}
          label="الفئات"
          value={categories.length}
          color="#8b5cf6"
          subtitle="فئة مختلفة"
        />
        <StatCard
          icon={<TagIcon size={24} />}
          label="متوسط السعر"
          value={products.length ? `$${(totalRevenue / products.length).toFixed(2)}` : '$0'}
          color="#ec4899"
          subtitle="لكل منتج"
        />
      </div>

      {/* Table Header */}
      <div className="admin__toolbar container">
        <div className="admin__toolbar-left">
          <h2 className="admin__table-title">قائمة المنتجات</h2>
          <span className="admin__table-count">{filtered.length} منتج</span>
        </div>
        <div className="admin__toolbar-right">
          <div className="admin__search">
            <input
              id="admin-search"
              type="search"
              className="form-input admin__search-input"
              placeholder="بحث في المنتجات..."
              value={searchAdmin}
              onChange={(e) => setSearchAdmin(e.target.value)}
              aria-label="Search products in admin"
            />
          </div>
          <button
            className="btn btn--ghost btn--icon"
            onClick={fetchProducts}
            aria-label="Refresh products"
            title="تحديث القائمة"
          >
            <RefreshIcon size={16} />
          </button>
          <button
            id="add-product-btn"
            className="btn btn--primary"
            onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          >
            <PlusIcon size={16} />
            <span>إضافة منتج</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="container">
        {loading ? (
          <div className="admin__loading">
            <div className="admin__spinner" aria-label="Loading products" />
            <p>جارٍ تحميل المنتجات...</p>
          </div>
        ) : error ? (
          <div className="admin__error">
            <p>⚠️ {error}</p>
            <button className="btn btn--primary" onClick={fetchProducts}>
              <RefreshIcon size={16} /> <span>إعادة المحاولة</span>
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin__empty">
            <PackageIcon size={56} />
            <p>لا توجد منتجات. ابدأ بإضافة منتج جديد!</p>
            <button
              className="btn btn--primary"
              onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
            >
              <PlusIcon size={16} /> <span>إضافة منتج</span>
            </button>
          </div>
        ) : (
          <div className="admin__table-wrap">
            <table className="admin__table" role="table" aria-label="Products table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">الصورة</th>
                  <th scope="col">اسم المنتج</th>
                  <th scope="col">الفئة</th>
                  <th scope="col">السعر</th>
                  <th scope="col">الوصف</th>
                  <th scope="col">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product, index) => (
                  <tr key={product.id} className="admin__table-row">
                    <td className="admin__table-id">{index + 1}</td>
                    <td>
                      <div className="admin__product-img-wrap">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="admin__product-img"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                          />
                        ) : null}
                        <div
                          className="admin__product-img-placeholder"
                          style={{ display: product.image ? 'none' : 'flex' }}
                        >
                          <ImageIcon size={20} />
                        </div>
                      </div>
                    </td>
                    <td className="admin__product-name">{product.name}</td>
                    <td>
                      {product.category ? (
                        <span className="admin__category-tag">{product.category}</span>
                      ) : (
                        <span className="admin__no-category">—</span>
                      )}
                    </td>
                    <td className="admin__price">${Number(product.price).toFixed(2)}</td>
                    <td className="admin__desc">
                      {product.description
                        ? product.description.length > 60
                          ? product.description.slice(0, 60) + '...'
                          : product.description
                        : <span className="admin__no-category">لا يوجد وصف</span>
                      }
                    </td>
                    <td>
                      <div className="admin__actions">
                        <button
                          id={`edit-product-${product.id}`}
                          className="admin__action-btn admin__action-btn--edit"
                          onClick={() => handleEdit(product)}
                          aria-label={`Edit ${product.name}`}
                          title="تعديل"
                        >
                          <EditIcon size={15} />
                        </button>
                        <button
                          id={`delete-product-${product.id}`}
                          className="admin__action-btn admin__action-btn--delete"
                          onClick={() => setDeleteTarget(product)}
                          aria-label={`Delete ${product.name}`}
                          title="حذف"
                        >
                          <TrashIcon size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingProduct(null); }}
        onSuccess={handleModalSuccess}
        editProduct={editingProduct}
      />
      <DeleteConfirmModal
        product={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
}
