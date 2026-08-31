import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Search, RefreshCw, User, Phone, MapPin, Tag } from 'lucide-react';

export default function Orders() {
  const { token, API_URL } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await axios.put(
        `${API_URL}/orders/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setOrders(orders.map(order => 
        order.id === id ? { ...order, status } : order
      ));
    } catch (err) {
      alert('فشل تحديث حالة الطلب');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.name && order.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.phone && order.phone.includes(searchTerm)) ||
      (order.id && order.id.toString().includes(searchTerm)) ||
      (order.address && order.address.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const map = {
      pending: { label: 'قيد الانتظار', class: 'badge pending' },
      processing: { label: 'جاري التجهيز', class: 'badge processing' },
      shipped: { label: 'تم الشحن', class: 'badge shipped' },
      delivered: { label: 'تم التوصيل', class: 'badge delivered' },
      cancelled: { label: 'ملغي', class: 'badge cancelled' },
    };
    return map[status] || { label: status, class: 'badge' };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '0.5rem' }}>
        <RefreshCw className="animate-spin" size={24} color="var(--primary)" />
        <span>جاري تحميل قائمة الطلبات...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>إدارة الطلبات</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>متابعة طلبات العملاء وحالة التوصيل</p>
        </div>
        <button onClick={fetchOrders} className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} />
          <span>تحديث الطلبات</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 250px', display: 'flex', alignItems: 'center', background: 'var(--bg-color)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <Search size={18} color="var(--text-muted)" style={{ marginLeft: '0.5rem' }} />
            <input
              type="text"
              placeholder="ابحث باسم العميل، الهوية، الهاتف، أو العنوان..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem' }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', background: 'var(--surface)', fontSize: '0.9rem' }}
          >
            <option value="all">جميع الحالات ({orders.length})</option>
            <option value="pending">قيد الانتظار (Pending)</option>
            <option value="processing">جاري التجهيز (Processing)</option>
            <option value="shipped">تم الشحن (Shipped)</option>
            <option value="delivered">تم التوصيل (Delivered)</option>
            <option value="cancelled">ملغي (Cancelled)</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th># رقم الطلب</th>
                <th>اسم العميل والهاتف</th>
                <th>عنوان التوصيل والنقطة الدالة</th>
                <th>المنتجات والكميات</th>
                <th>السعر الإجمالي</th>
                <th>حالة الطلب</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                const badge = getStatusBadge(order.status);
                return (
                  <tr key={order.id}>
                    <td>
                      <strong>#{order.id}</strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold' }}>
                        <User size={14} color="var(--primary)" />
                        {order.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        <Phone size={13} />
                        <span dir="ltr">{order.phone}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', maxWidth: '240px' }}>
                        <MapPin size={15} color="var(--primary)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                        <div>
                          <div>{order.address}</div>
                          {order.nearest_landmark && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              <Tag size={12} />
                              <span>نقطة دالة: {order.nearest_landmark}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <ul style={{ padding: 0, margin: 0, listStyle: 'none', fontSize: '0.85rem' }}>
                        {(order.items || []).map((item, i) => (
                          <li key={i} style={{ marginBottom: '0.2rem' }}>
                            <span style={{ fontWeight: '600' }}>{item.name || `منتج #${item.product_id}`}</span>{' '}
                            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>(x{item.quantity})</span>
                            {item.price && <span style={{ color: 'var(--text-muted)', marginRight: '0.4rem' }}>-${Number(item.price).toFixed(2)}</span>}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>
                      <strong style={{ color: '#0d9488', fontSize: '1.05rem' }}>
                        ${Number(order.total_amount).toFixed(2)}
                      </strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <span className={badge.class}>{badge.label}</span>
                        <select 
                          className="status-select" 
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          style={{ fontSize: '0.8rem', padding: '0.2rem 0.4rem' }}
                        >
                          <option value="pending">قيد الانتظار</option>
                          <option value="processing">جاري التجهيز</option>
                          <option value="shipped">تم الشحن</option>
                          <option value="delivered">تم التوصيل</option>
                          <option value="cancelled">إلغاء الطلب</option>
                        </select>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(order.created_at).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                    <div>لا توجد طلبات تطابق معايير البحث</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
