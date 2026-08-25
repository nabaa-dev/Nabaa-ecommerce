import { useState } from 'react';
import { CartProvider } from './context/CartContext';
import { useToast } from './hooks/useToast';
import Header from './components/Header/Header';
import StoreFront from './components/StoreFront/StoreFront';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import CartDrawer from './components/CartDrawer/CartDrawer';
import ToastContainer from './components/ToastContainer/ToastContainer';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('store');
  const [searchQuery, setSearchQuery] = useState('');
  const { toasts, addToast, removeToast } = useToast();

  return (
    <CartProvider>
      <div className="app" dir="rtl" lang="ar">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <main className="app__main">
          {activeTab === 'store' ? (
            <StoreFront searchQuery={searchQuery} />
          ) : (
            <AdminDashboard onToast={addToast} />
          )}
        </main>

        <footer className="footer">
          <div className="container footer__inner">
            <p className="footer__copy">
              © 2025 <span className="footer__brand">نبأ ستور</span>. جميع الحقوق محفوظة.
            </p>
            <p className="footer__tech">مبني بـ React + Vite ⚡</p>
          </div>
        </footer>

        <CartDrawer />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </CartProvider>
  );
}
