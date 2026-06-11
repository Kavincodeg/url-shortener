import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('linko_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('linko_token');
    if (token) {
      api.get('/auth/me')
        .then(({ data }) => {
          setUser(data.user);
          localStorage.setItem('linko_user', JSON.stringify(data.user));
        })
        .catch(() => {
          localStorage.removeItem('linko_token');
          localStorage.removeItem('linko_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('linko_token', data.token);
    localStorage.setItem('linko_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('linko_token', data.token);
    localStorage.setItem('linko_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('linko_token');
    localStorage.removeItem('linko_user');
    setUser(null);
  };

  const updateUser = (updated) => {
    setUser(updated);
    localStorage.setItem('linko_user', JSON.stringify(updated));
  };

  const loginWithToken = (token, user) => {
    localStorage.setItem('linko_token', token);
    localStorage.setItem('linko_user', JSON.stringify(user));
    setUser(user);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, loginWithToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
