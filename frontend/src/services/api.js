import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('janseva_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and token is invalid, clear token
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/citizen') && !currentPath.includes('/login')) {
        // preserve location or redirect if needed
      }
    }
    return Promise.reject(error);
  }
);

export default api;

