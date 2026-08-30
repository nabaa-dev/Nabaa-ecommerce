import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('admin_token') || null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (token) {
      axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        if (res.data.role !== 'admin') {
          throw new Error('Not an admin');
        }
        setUser(res.data);
        setLoading(false);
      }).catch(err => {
        console.error('Failed to fetch user', err);
        setToken(null);
        localStorage.removeItem('admin_token');
        setUser(null);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [token, API_URL]);

  const login = (userData, jwtToken) => {
    if (userData.role !== 'admin') {
      throw new Error('غير مصرح لك بالدخول، هذا الحساب ليس أدمن.');
    }
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('admin_token', jwtToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('admin_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
};
