import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { useToast } from './hooks/useToast';
import Header from './components/Header/Header';
import StoreFront from './components/StoreFront/StoreFront';
import CartDrawer from './components/CartDrawer/CartDrawer';
import ToastContainer from './components/ToastContainer/ToastContainer';
import Login from './pages/Login';
import Register from './pages/Register';
import MyOrders from './pages/MyOrders';
import './App.css';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const { toasts, addToast, removeToast } = useToast();

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="app" dir="rtl" lang="ar">
            <Header
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />

            <main className="app__main">
              <Routes>
                <Route path="/" element={<StoreFront searchQuery={searchQuery} />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>

            <footer className="footer">
              <div className="container footer__inner">
                <p className="footer__copy">
                  © 2025 <span className="footer__brand">نبأ ستور</span>. جميع الحقوق محفوظة.
                </p>
              </div>
            </footer>

            <CartDrawer />
            <ToastContainer toasts={toasts} onRemove={removeToast} />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
