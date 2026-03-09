import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set) => ({
  isAuthenticated: !!localStorage.getItem('token'),
  isChecking: !!localStorage.getItem('token'),
  user: null,
  token: localStorage.getItem('token') || null,
  login: (userData, token) => {
    localStorage.setItem('token', token);
    set({ isAuthenticated: true, user: userData, token, isChecking: false });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ isAuthenticated: false, user: null, token: null, isChecking: false });
  },
  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      set({ isChecking: true });
      try {
        const res = await api.get('/user/me');
        set({ 
          isAuthenticated: true, 
          user: res.data,
          token,
          isChecking: false 
        });
      } catch (err) {
        localStorage.removeItem('token');
        set({ isAuthenticated: false, user: null, token: null, isChecking: false });
      }
    } else {
      set({ isChecking: false, isAuthenticated: false });
    }
  }
}));
