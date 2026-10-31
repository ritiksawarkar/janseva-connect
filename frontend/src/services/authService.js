import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.success && response.data.data.token) {
    localStorage.setItem('janseva_token', response.data.data.token);
    localStorage.setItem('janseva_user', JSON.stringify(response.data.data.user));
  }
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.success && response.data.data.token) {
    localStorage.setItem('janseva_token', response.data.data.token);
    localStorage.setItem('janseva_user', JSON.stringify(response.data.data.user));
  }
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('janseva_token');
  localStorage.removeItem('janseva_user');
};

export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem('janseva_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export default {
  login,
  register,
  getMe,
  logout,
  getCurrentUser
};

