import { useState, useEffect } from 'react';
import { createProduct, updateProduct } from '../../services/api';
import { XIcon, PlusIcon, ImageIcon } from '../Icons';
import './ProductModal.css';

const INITIAL_FORM = { name: '', price: '', category: '', description: '', image: '' };

export default function ProductModal({ isOpen, onClose, onSuccess, editProduct }) {
  const [form, setForm]       = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  useEffect(() => {
    if (editProduct) {
      setForm({
        name:        editProduct.name        || '',
        price:       editProduct.price       || '',
        category:    editProduct.category    || '',
        description: editProduct.description || '',
        image:       editProduct.image       || '',
      });
    } else {
      setForm(INITIAL_FORM);
    }
    setErrors({});
  }, [editProduct, isOpen]);

  const validate = () => {
    const e = {};
    if (!form.name.trim())       e.name     = 'اسم المنتج مطلوب';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0)
                                  e.price    = 'السعر يجب أن يكون رقماً موجباً';
    if (!form.category.trim())   e.category = 'الفئة مطلوبة';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setLoading(true);
    try {
      const payload = { ...form, price: Number(form.price) };
      if (editProduct) {
        await updateProduct(editProduct.id, payload);
        onSuccess('تم تعديل المنتج بنجاح ✅', 'success');
      } else {
        await createProduct(payload);
        onSuccess('تم إضافة المنتج بنجاح ✅', 'success');
      }
      onClose();
    } catch (err) {
      onSuccess(err.message || 'حدث خطأ، يرجى المحاولة مرة أخرى', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal">
        {/* Header */}
        <div className="modal__header">
          <div className="modal__title-wrap">
            <div className="modal__icon"><PlusIcon size={20} /></div>
            <h2 className="modal__title" id="modal-title">
              {editProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </h2>
          </div>
          <button
            id="close-modal-btn"
            className="modal__close"
            onClick={onClose}
            aria-label="Close modal"
            type="button"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Image Preview */}
        {form.image && (
          <div className="modal__preview">
            <img
              src={form.image}
              alt="Product preview"
              className="modal__preview-img"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

        {/* Form */}
        <form className="modal__form" onSubmit={handleSubmit} noValidate>
          <div className="modal__grid">
            {/* Name */}
            <div className={`form-group form-group--full ${errors.name ? 'form-group--error' : ''}`}>
              <label htmlFor="product-name" className="form-label">
                اسم المنتج <span className="form-required">*</span>
              </label>
              <input
                id="product-name"
                type="text"
                name="name"
                className="form-input"
                placeholder="مثال: حقيبة جلدية فاخرة"
                value={form.name}
                onChange={handleChange}
                autoFocus
              />
              {errors.name && <span className="form-error" role="alert">{errors.name}</span>}
            </div>

            {/* Price */}
            <div className={`form-group ${errors.price ? 'form-group--error' : ''}`}>
              <label htmlFor="product-price" className="form-label">
                السعر ($) <span className="form-required">*</span>
              </label>
              <input
                id="product-price"
                type="number"
                name="price"
                className="form-input"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
              />
              {errors.price && <span className="form-error" role="alert">{errors.price}</span>}
            </div>

            {/* Category */}
            <div className={`form-group ${errors.category ? 'form-group--error' : ''}`}>
              <label htmlFor="product-category" className="form-label">
                الفئة <span className="form-required">*</span>
              </label>
              <input
                id="product-category"
                type="text"
                name="category"
                className="form-input"
                placeholder="مثال: إلكترونيات"
                value={form.category}
                onChange={handleChange}
                list="categories-list"
              />
              <datalist id="categories-list">
                <option value="إلكترونيات" />
                <option value="ملابس" />
                <option value="أجهزة منزلية" />
                <option value="رياضة" />
                <option value="كتب" />
                <option value="جمال وعناية" />
              </datalist>
              {errors.category && <span className="form-error" role="alert">{errors.category}</span>}
            </div>

            {/* Image URL */}
            <div className="form-group form-group--full">
              <label htmlFor="product-image" className="form-label">رابط الصورة</label>
              <div className="form-input-icon-wrap">
                <ImageIcon size={15} className="form-input-icon" />
                <input
                  id="product-image"
                  type="url"
                  name="image"
                  className="form-input form-input--with-icon"
                  placeholder="https://example.com/image.jpg"
                  value={form.image}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-group form-group--full">
              <label htmlFor="product-description" className="form-label">الوصف</label>
              <textarea
                id="product-description"
                name="description"
                className="form-input form-textarea"
                placeholder="وصف مختصر للمنتج..."
                rows={3}
                value={form.description}
                onChange={handleChange}
              />
            </div>
          </div>
        </form>

        {/* Actions */}
        <div className="modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={loading}>
            إلغاء
          </button>
          <button
            id="submit-product-btn"
            type="button"
            className="btn btn--primary"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? <span className="btn__spinner" aria-hidden="true" /> : <PlusIcon size={16} />}
            <span>{loading ? 'جارٍ الحفظ...' : editProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
