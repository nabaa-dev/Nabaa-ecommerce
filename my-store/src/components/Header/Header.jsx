import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCartIcon, SearchIcon, StoreIcon, UserIcon, LogOutIcon } from '../Icons';
import './Header.css';

export default function Header({ searchQuery, setSearchQuery }) {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header__inner container">
        {/* Logo */}
        <Link to="/" className="header__logo">
          <div className="header__logo-icon">
            <StoreIcon size={22} />
          </div>
          <div className="header__logo-text">
            <span className="header__brand">المتجر</span>
            <span className="header__tagline">STORE</span>
          </div>
        </Link>

        {/* Navigation / Auth Links */}
        <nav className="header__nav" role="navigation" aria-label="Main Navigation">
          {user ? (
            <div className="header__user-menu">
              <span className="header__username">
                <UserIcon size={15} /> {user.name}
              </span>
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
