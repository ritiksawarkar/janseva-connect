import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const citizen = authService.getCurrentUser();
      if (citizen) return citizen;
      const admin = localStorage.getItem('adminUser');
      return admin ? JSON.parse(admin) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('janseva_token') || localStorage.getItem('adminToken') || null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const citizenToken = localStorage.getItem('janseva_token');
      const adminToken = localStorage.getItem('adminToken');

      if (citizenToken) {
        try {
          const res = await authService.getMe();
          if (res && res.data && res.data.user) {
            setUser(res.data.user);
            setToken(citizenToken);
          }
        } catch {
          authService.logout();
          setUser(null);
          setToken(null);
        }
      } else if (adminToken) {
        try {
          const storedAdmin = localStorage.getItem('adminUser');
          if (storedAdmin) {
            setUser(JSON.parse(storedAdmin));
            setToken(adminToken);
          }
        } catch {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          setUser(null);
          setToken(null);
        }
      } else {
        // Auto-login default demo citizen for seamless testing
        try {
          const res = await authService.login('citizen@janseva.gov.in', 'Citizen@123');
          if (res && res.data && res.data.user) {
            setUser(res.data.user);
            setToken(res.data.token);
          }
        } catch (e) {
          console.warn('Auto-login default demo citizen unavailable:', e.message);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      if (res && res.data && res.data.user) {
        const loggedUser = res.data.user;
        const loggedToken = res.data.token;
        setUser(loggedUser);
        setToken(loggedToken);

        if (loggedUser.role === 'ADMIN') {
          localStorage.setItem('adminToken', loggedToken);
          localStorage.setItem('adminUser', JSON.stringify(loggedUser));
        } else {
          localStorage.setItem('janseva_token', loggedToken);
          localStorage.setItem('janseva_user', JSON.stringify(loggedUser));
        }
        return res;
      }
      return res;
    } catch (err) {
      return { success: false, message: err.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authService.register(userData);
      if (res && res.data && res.data.user) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('janseva_token', res.data.token);
        localStorage.setItem('janseva_user', JSON.stringify(res.data.user));
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setUser(null);
    setToken(null);
  };

  const quickLogin = async (email, password) => {
    return await login(email, password);
  };

  const isAuthenticated = Boolean(user && token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isLoading: loading,
        isAuthenticated,
        isAdmin: Boolean(user && user.role === 'ADMIN'),
        login,
        register,
        logout,
        quickLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
