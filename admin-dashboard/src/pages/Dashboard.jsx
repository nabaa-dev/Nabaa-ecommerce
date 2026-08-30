import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const { token, API_URL } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          axios.get(`${API_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/products`) // Products is public
        ]);

        const orders = ordersRes.data;
        const products = productsRes.data;

        setStats({
          totalOrders: orders.length,
          totalRevenue: orders.reduce((acc, order) => acc + Number(order.total_amount), 0),
          totalProducts: products.length,
          recentOrders: orders.slice(0, 5)
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, API_URL]);

  if (loading) return <div>جاري تحميل البيانات...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>نظرة عامة</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: '#eef2ff', padding: '1rem', borderRadius: '12px', color: '#4f46e5' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>إجمالي الإيرادات</p>
            <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem' }}>${stats.totalRevenue.toFixed(2)}</h3>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '12px', color: '#d97706' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>الطلبات</p>
            <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem' }}>{stats.totalOrders}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: '#dcfce7', padding: '1rem', borderRadius: '12px', color: '#15803d' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>المنتجات</p>
            <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem' }}>{stats.totalProducts}</h3>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem' }}>أحدث الطلبات</h2>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>رقم الطلب</th>
                <th>العميل</th>
                <th>المبلغ</th>
                <th>الحالة</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.name}</td>
                  <td>${Number(order.total_amount).toFixed(2)}</td>
                  <td><span className={`badge ${order.status}`}>{order.status}</span></td>
                  <td>{new Date(order.created_at).toLocaleDateString('ar-EG')}</td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>لا توجد طلبات حديثة</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
