import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ShoppingBagIcon, ArrowRightIcon } from '../components/Icons';
import './MyOrders.css';

export default function MyOrders() {
  const { user, token, API_URL } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
      return;
    }

    const fetchMyOrders = async () => {
      try {
        const res = await axios.get(`${API_URL}/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data);
      } catch (err) {
        setError('حدث خطأ أثناء جلب طلباتك');
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [user, token, API_URL, navigate]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="order-badge order-badge--pending">⏳ قيد الانتظار</span>;
      case 'processing':
        return <span className="order-badge order-badge--processing">⚡ جاري التجهيز</span>;
      case 'shipped':
        return <span className="order-badge order-badge--shipped">🚚 تم الشحن</span>;
      case 'delivered':
        return <span className="order-badge order-badge--delivered">✅ تم التوصيل</span>;
      case 'cancelled':
        return <span className="order-badge order-badge--cancelled">❌ ملغي</span>;
      default:
        return <span className="order-badge">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="container my-orders-page">
        <div className="my-orders-loading">جاري تحميل طلباتك...</div>
      </div>
    );
  }

  return (
    <div className="container my-orders-page">
      <div className="my-orders-header">
        <button onClick={() => navigate('/')} className="back-btn">
          <ArrowRightIcon size={18} />
          <span>الرجوع للمتجر</span>
        </button>
        <h1>طلبـاتي والتتبع</h1>
      </div>

      {error && <div className="auth-error">{error}</div>}

      {orders.length === 0 ? (
        <div className="my-orders-empty">
          <ShoppingBagIcon size={48} className="empty-icon" />
          <h3>لا توجد طلبات سابقة</h3>
          <p>استكشف المنتجات وأضف ما يعجبك إلى السلة!</p>
          <button className="btn btn--primary" onClick={() => navigate('/')}>
            تسوق الآن
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card__header">
                <div>
                  <span className="order-id">طلب #{order.id}</span>
                  <span className="order-date">
                    {new Date(order.created_at).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div>{getStatusBadge(order.status)}</div>
              </div>

              <div className="order-card__body">
                <div className="order-info-section">
                  <h4>تفاصيل التوصيل</h4>
                  <p><strong>الاسم:</strong> {order.name}</p>
                  <p><strong>الهاتف:</strong> {order.phone}</p>
                  <p><strong>العنوان:</strong> {order.address}</p>
                  {order.nearest_landmark && (
                    <p><strong>أقرب نقطة دالة:</strong> {order.nearest_landmark}</p>
                  )}
                </div>

                <div className="order-items-section">
                  <h4>المنتجات المطلوبة</h4>
                  <ul className="order-items-list">
                    {(order.items || []).map((item, idx) => (
                      <li key={idx} className="order-item-row">
                        <span>{item.name} × {item.quantity}</span>
                        <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="order-card__footer">
                <span>إجمالي الطلب:</span>
                <span className="order-total-amount">${Number(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
