import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function Products() {
  const { token, API_URL } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simple state for add/edit modal (in a real app, we'd use a proper modal component)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '', price: '', category: '', description: '', image: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    try {
      await axios.delete(`${API_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      alert('فشل حذف المنتج');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const res = await axios.put(`${API_URL}/products/${editingProduct.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(products.map(p => p.id === editingProduct.id ? res.data : p));
      } else {
        const res = await axios.post(`${API_URL}/products`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts([res.data, ...products]);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'فشل حفظ المنتج');
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', price: '', category: '', description: '', image: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description || '',
      image: product.image || ''
    });
    setIsModalOpen(true);
  };

  if (loading) return <div>جاري تحميل المنتجات...</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>المنتجات</h1>
        <button onClick={openAddModal} className="btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
          <Plus size={18} /> إضافة منتج
        </button>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>صورة</th>
                <th>الاسم</th>
                <th>السعر</th>
                <th>الفئة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>
                    {product.image ? (
                      <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', background: '#e5e7eb', borderRadius: '4px' }}></div>
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td>${Number(product.price).toFixed(2)}</td>
                  <td><span className="badge" style={{ background: '#eef2ff', color: '#4f46e5' }}>{product.category}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openEditModal(product)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#2563eb' }}><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(product.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#dc2626' }}><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>لا توجد منتجات حتى الآن</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Very Simple Modal inline for brevity */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginTop: 0 }}>{editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>اسم المنتج</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>السعر ($)</label>
                <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <div className="form-group">
                <label>الفئة</label>
                <input type="text" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
              </div>
              <div className="form-group">
                <label>رابط الصورة (اختياري)</label>
                <input type="text" dir="ltr" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
              </div>
              <div className="form-group">
                <label>الوصف (اختياري)</label>
                <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '0.75rem', background: '#e5e7eb', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  إلغاء
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
