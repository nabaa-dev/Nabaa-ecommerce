import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCartIcon, SearchIcon, StoreIcon, UserIcon, LogOutIcon, ShoppingBagIcon } from '../Icons';
import './Header.css';

export default function Header({ searchQuery, setSearchQuery }) {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header__inner container">
        {/* Logo */}
        <Link to="/" className="header__logo" aria-label="الصفحة الرئيسية">
          <div className="header__logo-badge">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="36" rx="10" fill="url(#logo-grad)"/>
              <path d="M12 15L18 9L24 15V25C24 26.1046 23.1046 27 22 27H14C12.8954 27 12 26.1046 12 25V15Z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 15C15 16.6569 16.3431 18 18 18C19.6569 18 21 16.6569 21 15" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              <defs>
                <linearGradient id="logo-grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0d9488"/>
                  <stop offset="1" stopColor="#38bdf8"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="header__logo-text">
            <span className="header__brand">المتجر</span>
            <span className="header__tagline">PREMIUM STORE</span>
          </div>
        </Link>

        {/* Navigation / Auth Links */}
        <nav className="header__nav" role="navigation" aria-label="Main Navigation">
          {user ? (
            <div className="header__user-menu">
              <span className="header__username">
                <UserIcon size={15} /> {user.name}
              </span>
              <Link to="/my-orders" className="header__tab header__tab--orders">
                <ShoppingBagIcon size={15} /> طلباتي
              </Link>
              <button onClick={logout} className="header__logout-btn">
                <LogOutIcon size={15} /> خروج
              </button>
            </div>
          ) : (
            <div className="header__auth-links">
              <Link to="/login" className="header__tab">تسجيل الدخول</Link>
              <Link to="/register" className="header__tab">إنشاء حساب</Link>
            </div>
          )}
        </nav>

        {/* Search + Cart */}
        <div className="header__actions">
          <div className="header__search">
            <SearchIcon size={15} className="header__search-icon" />
            <input
              id="search-input"
              type="search"
              className="header__search-input"
              placeholder="ابحث عن منتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search products"
            />
          </div>
          
          <button
            id="cart-btn"
            className="header__cart-btn"
            onClick={() => setIsCartOpen(true)}
            aria-label={`Cart with ${totalItems} items`}
          >
            <ShoppingCartIcon size={20} />
            {totalItems > 0 && (
              <span className="header__cart-badge" aria-hidden="true">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
