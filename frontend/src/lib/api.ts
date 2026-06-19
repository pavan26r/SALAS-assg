import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('sales_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('sales_token');
      localStorage.removeItem('sales_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  signup: (name: string, email: string, password: string, role?: string) =>
    api.post('/auth/signup', { name, email, password, role }),
  me: () => api.get('/auth/me'),
};

// Calls
export const callsAPI = {
  create: (data: { title: string; customerName: string; salesRepName: string; transcript: string; callDate?: string }) =>
    api.post('/calls', data),
  getAll: (params?: { page?: number; limit?: number; outcome?: string }) =>
    api.get('/calls', { params }),
  getById: (id: string) => api.get(`/calls/${id}`),
  reanalyze: (id: string) => api.post(`/calls/${id}/reanalyze`),
  delete: (id: string) => api.delete(`/calls/${id}`),
};

// Analytics
export const analyticsAPI = {
  overview: () => api.get('/analytics/overview'),
};

export default api;
