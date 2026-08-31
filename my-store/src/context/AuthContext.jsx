import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  const rawApiUrl = import.meta.env.VITE_API_URL || '/api';
  const API_URL = rawApiUrl.replace(/\/$/, '');

  useEffect(() => {
    if (token) {
      axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setUser(res.data);
        setLoading(false);
      }).catch(err => {
        console.error('Failed to fetch user', err);
        setToken(null);
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [token, API_URL]);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('token', jwtToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
};
