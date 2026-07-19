import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [admin, setAdmin]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('admin');
    const token  = localStorage.getItem('token');
    if (stored && token) {
      setAdmin(JSON.parse(stored));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/admin/login', { email, password });
    const { token, admin } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('admin', JSON.stringify(admin));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setAdmin(admin);
    return admin;
  };

  const logout = async () => {
    try { await api.post('/admin/logout'); } catch (e) {}
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    delete api.defaults.headers.common['Authorization'];
    setAdmin(null);
  };

  const updateAdmin = (updatedAdmin) => {
    setAdmin(updatedAdmin);
    localStorage.setItem('admin', JSON.stringify(updatedAdmin));
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, setAdmin: updateAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);