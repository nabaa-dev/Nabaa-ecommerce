import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCartIcon, SearchIcon, UserIcon, LogOutIcon, ShoppingBagIcon, MenuIcon, XIcon, ActivityIcon } from '../Icons';
import './Header.css';

export default function Header({ searchQuery, setSearchQuery }) {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Close mobile menu on route change
  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);

  return (
    <header className="header">
      <div className="header__inner container">
        
        {/* Mobile Menu Toggle */}
        <button 
          className="header__mobile-toggle" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
        </button>

        {/* Logo */}
        <Link to="/" className="header__logo" onClick={closeMobileMenu} aria-label="الصفحة الرئيسية - نبض ستور">
          <div className="header__logo-badge">
            <ActivityIcon size={24} className="header__logo-pulse" />
          </div>
          <div className="header__logo-text">
            <span className="header__brand">نبض ستور</span>
            <span className="header__tagline">NABD STORE</span>
          </div>
        </Link>

        {/* Search */}
        <div className="header__search">
          <SearchIcon size={18} className="header__search-icon" />
          <input
            type="search"
            className="header__search-input"
            placeholder="ابحث عن منتج..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search products"
          />
        </div>

        {/* Navigation & Actions */}
        <div className={`header__actions-wrapper ${isMobileMenuOpen ? 'header__actions-wrapper--open' : ''}`}>
          <nav className="header__nav">
            {user ? (
              <>
                <div className="header__user-badge">
                  <UserIcon size={18} />
                  <span>{user.name}</span>
                </div>
                <Link to="/my-orders" className="header__btn" onClick={closeMobileMenu}>
                  <ShoppingBagIcon size={18} />
                  <span>طلباتي</span>
                </Link>
                <button onClick={() => { logout(); closeMobileMenu(); }} className="header__btn header__btn--logout">
                  <LogOutIcon size={18} />
                  <span>تسجيل الخروج</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="header__btn" onClick={closeMobileMenu}>
                  <UserIcon size={18} />
                  <span>تسجيل الدخول</span>
                </Link>
                <Link to="/register" className="header__btn header__btn--primary" onClick={closeMobileMenu}>
                  إنشاء حساب
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Cart - Always visible */}
        <button
          className="header__cart-btn"
          onClick={() => setIsCartOpen(true)}
          aria-label={`Cart with ${totalItems} items`}
        >
          <ShoppingCartIcon size={22} />
          {totalItems > 0 && (
            <span className="header__cart-badge">{totalItems > 99 ? '99+' : totalItems}</span>
          )}
        </button>
      </div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div className="header__overlay" onClick={closeMobileMenu}></div>
      )}
    </header>
  );
}
