import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { XIcon, PlusIcon, MinusIcon, TrashIcon, ShoppingBagIcon, ArrowRightIcon } from '../Icons';
import './CartDrawer.css';

function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="cart-item">
      <div className="cart-item__img-wrap">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="cart-item__img"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="cart-item__img-fallback" style={{ display: item.image ? 'none' : 'flex' }}>
          <ShoppingBagIcon size={22} />
        </div>
      </div>

      <div className="cart-item__info">
        <p className="cart-item__name">{item.name}</p>
        <p className="cart-item__price">${Number(item.price).toFixed(2)}</p>
        <div className="cart-item__qty">
          <button
            className="cart-item__qty-btn"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            aria-label="Decrease quantity"
          >
            <MinusIcon size={13} />
          </button>
          <span className="cart-item__qty-value">{item.quantity}</span>
          <button
            className="cart-item__qty-btn"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            aria-label="Increase quantity"
          >
            <PlusIcon size={13} />
          </button>
        </div>
      </div>

      <div className="cart-item__right">
        <p className="cart-item__subtotal">
          ${(item.price * item.quantity).toFixed(2)}
        </p>
        <button
          className="cart-item__remove"
          onClick={() => removeFromCart(item.id)}
          aria-label={`Remove ${item.name}`}
        >
          <TrashIcon size={14} />
        </button>
      </div>
    </div>
  );
}

export default function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, totalPrice, totalItems, clearCart } = useCart();
  const { user, token, API_URL } = useAuth();
  const navigate = useNavigate();
  const drawerRef = useRef(null);

  const [step, setStep] = useState('cart'); // 'cart' | 'checkout' | 'success'
  const [formData, setFormData] = useState({ name: user?.name || '', phone: '', address: '', nearest_landmark: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.name && !formData.name) {
      setFormData(prev => ({ ...prev, name: user.name }));
    }
  }, [user]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setIsCartOpen(false); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [setIsCartOpen]);

  useEffect(() => {
    document.body.style.overflow = isCartOpen ? 'hidden' : '';
    if (isCartOpen) {
      drawerRef.current?.focus();
      if (step === 'success') setStep('cart');
    }
    return () => { document.body.style.overflow = ''; };
  }, [isCartOpen]);

  const handleProceedToCheckout = () => {
    if (!user) {
      setIsCartOpen(false);
      navigate('/login');
    } else {
      setFormData(prev => ({ ...prev, name: user.name || prev.name }));
      setStep('checkout');
    }
  };

  const submitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await axios.post(
        `${API_URL}/orders`,
        {
          name: formData.name || user.name,
          phone: formData.phone,
          address: formData.address,
          nearest_landmark: formData.nearest_landmark,
          cart_items: cartItems,
          total_amount: totalPrice
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      clearCart();
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء إتمام الطلب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={`cart-overlay ${isCartOpen ? 'cart-overlay--visible' : ''}`}
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />
      <aside
        ref={drawerRef}
        className={`cart-drawer ${isCartOpen ? 'cart-drawer--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
        tabIndex={-1}
      >
        <div className="cart-drawer__header">
          <div className="cart-drawer__title-wrap">
            <ShoppingBagIcon size={20} />
            <h2 className="cart-drawer__title">
              {step === 'checkout' ? 'إتمام الطلب' : 'سلة التسوق'}
            </h2>
            {totalItems > 0 && step === 'cart' && (
              <span className="cart-drawer__count">{totalItems}</span>
            )}
          </div>
          <button
            id="close-cart-btn"
            className="cart-drawer__close"
            onClick={() => {
              setIsCartOpen(false);
              setTimeout(() => setStep('cart'), 300);
            }}
            aria-label="Close cart"
          >
            <XIcon size={18} />
          </button>
        </div>

        <div className="cart-drawer__body">
          {step === 'success' ? (
            <div className="cart-drawer__empty">
              <div className="cart-drawer__empty-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                <ShoppingBagIcon size={40} />
              </div>
              <p className="cart-drawer__empty-title">تم إرسال طلبك بنجاح!</p>
              <p className="cart-drawer__empty-subtitle">
                شكراً لتسوقك معنا. سنتواصل معك قريباً.
              </p>
              <button 
                className="btn-primary" 
                style={{ marginTop: '2rem', width: 'auto', padding: '0.75rem 2rem' }}
                onClick={() => setIsCartOpen(false)}
              >
                متابعة التسوق
              </button>
            </div>
          ) : step === 'checkout' ? (
            <div className="cart-drawer__checkout-form">
              {error && <div className="auth-error" style={{marginBottom: '1rem'}}>{error}</div>}
              <form onSubmit={submitOrder} className="checkout-form">
                <div className="form-group">
                  <label>الاسم الكامل</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="أدخل اسمك الثلاثي"
                  />
                </div>
                <div className="form-group">
                  <label>رقم الهاتف</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>العنوان بالكامل</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>أقرب نقطة دالة (اختياري)</label>
                  <input
                    type="text"
                    value={formData.nearest_landmark}
                    onChange={e => setFormData({...formData, nearest_landmark: e.target.value})}
                  />
                </div>
                
                <div className="cart-drawer__summary" style={{ marginTop: '2rem' }}>
                  <div className="cart-drawer__summary-row cart-drawer__summary-row--total">
                    <span>المطلوب دفعه</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="cart-drawer__clear-btn" onClick={() => setStep('cart')}>
                    رجوع للسلة
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'جاري الإرسال...' : 'تأكيد الطلب'}
                  </button>
                </div>
              </form>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="cart-drawer__empty">
              <div className="cart-drawer__empty-icon">
                <ShoppingBagIcon size={40} />
              </div>
              <p className="cart-drawer__empty-title">السلة فارغة</p>
              <p className="cart-drawer__empty-subtitle">
                أضف بعض المنتجات الرائعة إلى سلتك
              </p>
            </div>
          ) : (
            <div className="cart-drawer__items">
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && step === 'cart' && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__summary">
              <div className="cart-drawer__summary-row">
                <span>المجموع الجزئي</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="cart-drawer__summary-row">
                <span>الشحن</span>
                <span className="cart-drawer__free">🚚 مجاني</span>
              </div>
              <div className="cart-drawer__summary-row cart-drawer__summary-row--total">
                <span>الإجمالي</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <button
              id="checkout-btn"
              className="cart-drawer__checkout-btn"
              onClick={handleProceedToCheckout}
            >
              <span>{user ? 'متابعة الدفع' : 'تسجيل الدخول لإتمام الطلب'}</span>
              <ArrowRightIcon size={18} />
            </button>
            <button className="cart-drawer__clear-btn" onClick={clearCart}>
              مسح السلة
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
