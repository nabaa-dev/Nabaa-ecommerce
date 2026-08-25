import { useCart } from '../../context/CartContext';
import { ShoppingCartIcon, SearchIcon, StoreIcon, LayoutDashboardIcon } from '../Icons';
import './Header.css';

export default function Header({ activeTab, setActiveTab, searchQuery, setSearchQuery }) {
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <header className="header">
      <div className="header__inner container">
        {/* Logo */}
        <div
          className="header__logo"
          onClick={() => setActiveTab('store')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setActiveTab('store')}
        >
          <div className="header__logo-icon">
            <StoreIcon size={22} />
          </div>
          <div className="header__logo-text">
            <span className="header__brand">نبأ</span>
            <span className="header__tagline">STORE</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="header__nav" role="navigation" aria-label="Main Navigation">
          <button
            id="tab-store"
            className={`header__tab ${activeTab === 'store' ? 'header__tab--active' : ''}`}
            onClick={() => setActiveTab('store')}
            aria-pressed={activeTab === 'store'}
          >
            <StoreIcon size={15} />
            <span>المتجر</span>
          </button>
          <button
            id="tab-admin"
            className={`header__tab ${activeTab === 'admin' ? 'header__tab--active' : ''}`}
            onClick={() => setActiveTab('admin')}
            aria-pressed={activeTab === 'admin'}
          >
            <LayoutDashboardIcon size={15} />
            <span>لوحة التحكم</span>
          </button>
        </nav>

        {/* Search + Cart */}
        <div className="header__actions">
          {activeTab === 'store' && (
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
          )}
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
