import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Orders() {
  const { token, API_URL } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
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

  if (loading) return <div>جاري تحميل الطلبات...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>الطلبات</h1>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>رقم الطلب</th>
                <th>تفاصيل العميل</th>
                <th>العنوان</th>
                <th>المنتجات</th>
                <th>الإجمالي</th>
                <th>الحالة</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>
                    <div><strong>{order.name}</strong></div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{order.phone}</div>
                  </td>
                  <td>
                    <div style={{ maxWidth: '200px' }}>{order.address}</div>
                    {order.nearest_landmark && (
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>نقطة دالة: {order.nearest_landmark}</div>
                    )}
                  </td>
                  <td>
                    <ul style={{ padding: 0, margin: 0, listStylePosition: 'inside', fontSize: '0.875rem' }}>
                      {(order.items || []).map((item, i) => (
                        <li key={i}>{item.name} (x{item.quantity})</li>
                      ))}
                    </ul>
                  </td>
                  <td>${Number(order.total_amount).toFixed(2)}</td>
                  <td>
                    <select 
                      className="status-select" 
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    >
                      <option value="pending">قيد الانتظار (Pending)</option>
                      <option value="processing">جاري التجهيز (Processing)</option>
                      <option value="shipped">تم الشحن (Shipped)</option>
                      <option value="delivered">تم التوصيل (Delivered)</option>
                      <option value="cancelled">ملغي (Cancelled)</option>
                    </select>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString('ar-EG')}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>لا توجد طلبات حتى الآن</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
