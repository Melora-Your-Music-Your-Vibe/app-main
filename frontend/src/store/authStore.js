import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,
  error: null,

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/register', data);
      localStorage.setItem('accessToken', res.data.data.accessToken);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
      set({ user: res.data.data.user, isAuthenticated: true, loading: false });
      return res.data;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || 'Registration failed' });
      throw err;
    }
  },

  login: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', data);
      localStorage.setItem('accessToken', res.data.data.accessToken);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
      set({ user: res.data.data.user, isAuthenticated: true, loading: false });
      return res.data;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || 'Login failed' });
      throw err;
    }
  },

  guestLogin: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/guest');
      localStorage.setItem('accessToken', res.data.data.accessToken);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
      set({ user: res.data.data.user, isAuthenticated: true, loading: false });
      return res.data;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || 'Guest login failed' });
      throw err;
    }
  },

  sendOTP: async (email) => {
    const res = await api.post('/auth/otp-login', { email });
    return res.data;
  },

  verifyOTP: async (email, otp) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      localStorage.setItem('accessToken', res.data.data.accessToken);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
      set({ user: res.data.data.user, isAuthenticated: true, loading: false });
      return res.data;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || 'OTP verification failed' });
      throw err;
    }
  },

  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  logout: async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { set({ isAuthenticated: false }); return; }
    try {
      const res = await api.get('/auth/me');
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
      set({ user: res.data.data.user, isAuthenticated: true });
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false });
      throw new Error('Unauthorized');
    }
  },
}));

export default useAuthStore;
