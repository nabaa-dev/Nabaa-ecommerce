import { useEffect, useRef } from 'react';
import { useCart } from '../../context/CartContext';
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
  const drawerRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setIsCartOpen(false); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [setIsCartOpen]);

  useEffect(() => {
    document.body.style.overflow = isCartOpen ? 'hidden' : '';
    if (isCartOpen) drawerRef.current?.focus();
    return () => { document.body.style.overflow = ''; };
  }, [isCartOpen]);

  const handleCheckout = () => {
    alert('🎉 شكراً لتسوقك معنا! تم إتمام الطلب بنجاح.');
    clearCart();
    setIsCartOpen(false);
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
        {/* Header */}
        <div className="cart-drawer__header">
          <div className="cart-drawer__title-wrap">
            <ShoppingBagIcon size={20} />
            <h2 className="cart-drawer__title">سلة التسوق</h2>
            {totalItems > 0 && (
              <span className="cart-drawer__count">{totalItems}</span>
            )}
          </div>
          <button
            id="close-cart-btn"
            className="cart-drawer__close"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="cart-drawer__body">
          {cartItems.length === 0 ? (
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

        {/* Footer */}
        {cartItems.length > 0 && (
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
              onClick={handleCheckout}
            >
              <span>إتمام الشراء</span>
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
