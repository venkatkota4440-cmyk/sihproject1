import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('agrinex_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          if (res.success) {
            setUser(res.data);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Session expired or offline:', err.message);
          // Keep cached demo user if exists in localStorage
          const cached = localStorage.getItem('agrinex_user');
          if (cached) {
            setUser(JSON.parse(cached));
          } else {
            logout();
          }
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (identifierOrEmail, password) => {
    const payload = typeof identifierOrEmail === 'object'
      ? identifierOrEmail
      : { identifier: identifierOrEmail, password };
    const res = await api.post('/auth/login', payload);
    if (res.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('agrinex_token', res.data.token);
      localStorage.setItem('agrinex_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const loginWithOtp = async (phone, otp, role = 'FARMER') => {
    const res = await api.post('/auth/login-otp', { phone, otp, role });
    if (res.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('agrinex_token', res.data.token);
      localStorage.setItem('agrinex_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const sendOtp = async (phone, email) => {
    return await api.post('/auth/send-otp', { phone, email });
  };

  const demoLogin = async (role = 'FARMER') => {
    try {
      const res = await api.post('/auth/demo-login', { role });
      if (res.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('agrinex_token', res.data.token);
        localStorage.setItem('agrinex_user', JSON.stringify(res.data.user));
      }
      return res;
    } catch (err) {
      // Local fallback in case server was restarting
      const mockRoles = {
        FARMER: { id: 'user_farmer_1', name: 'Ramesh Patel', role: 'FARMER', email: 'farmer@agrinex.com', rating: 4.9, location: { district: 'Nashik', state: 'Maharashtra' } },
        BUYER: { id: 'user_buyer_1', name: 'FreshDirect Wholesale', role: 'BUYER', email: 'buyer@agrinex.com', rating: 4.8, location: { district: 'Navi Mumbai', state: 'Maharashtra' } },
        TRANSPORTER: { id: 'user_transporter_1', name: 'Kisan Logistics Express', role: 'TRANSPORTER', email: 'transporter@agrinex.com', rating: 4.95, location: { district: 'Pune', state: 'Maharashtra' } },
        ADMIN: { id: 'user_admin_1', name: 'AgriNex Admin', role: 'ADMIN', email: 'admin@agrinex.com' }
      };
      const fallbackUser = mockRoles[role.toUpperCase()] || mockRoles.FARMER;
      setUser(fallbackUser);
      setToken('demo_mock_token');
      localStorage.setItem('agrinex_token', 'demo_mock_token');
      localStorage.setItem('agrinex_user', JSON.stringify(fallbackUser));
      return { success: true, data: { user: fallbackUser } };
    }
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('agrinex_token', res.data.token);
      localStorage.setItem('agrinex_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('agrinex_token');
    localStorage.removeItem('agrinex_user');
    sessionStorage.removeItem('agrinex_guest_browse');
    sessionStorage.removeItem('agrinex_tour_seen');
    try {
      sessionStorage.clear();
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        loginWithOtp,
        sendOtp,
        demoLogin,
        register,
        logout,
        isAuthenticated: !!user,
        isFarmer: user?.role === 'FARMER',
        isBuyer: user?.role === 'BUYER',
        isTransporter: user?.role === 'TRANSPORTER',
        isAdmin: user?.role === 'ADMIN'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
