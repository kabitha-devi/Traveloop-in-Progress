import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = 'http://localhost:5000/api';

const useAuthStore = create(
  persist(
    (set) => ({
  currentUser: null,
  isAuthenticated: false,
  isLoading: false,
  accessToken: null,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Login failed');
      
      set({ 
        currentUser: data.data.user, 
        isAuthenticated: true, 
        isLoading: false,
        accessToken: data.data.accessToken
      });
      return data.data.user;
    } catch (error) {
      set({ isLoading: false });
      throw new Error(error.message || 'Login failed');
    }
  },

  register: async (userData) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Registration failed');
      
      set({ 
        currentUser: data.data.user, 
        isAuthenticated: true, 
        isLoading: false,
        accessToken: data.data.accessToken
      });
      return data.data.user;
    } catch (error) {
      set({ isLoading: false });
      throw new Error(error.message || 'Registration failed');
    }
  },

  logout: async () => {
    try {
      const state = useAuthStore.getState();
      if (state.accessToken) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${state.accessToken}` },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    set({ currentUser: null, isAuthenticated: false, accessToken: null });
  },

  updateProfile: (updates) => {
    set((state) => ({
      currentUser: state.currentUser ? { ...state.currentUser, ...updates } : null,
    }));
  },
    }),
    {
      name: 'traveloop-auth',
      partialize: (state) => ({ 
        currentUser: state.currentUser, 
        isAuthenticated: state.isAuthenticated, 
        accessToken: state.accessToken 
      }),
    }
  )
);

export default useAuthStore;
