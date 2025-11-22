import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { userService } from 'config/database';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (user: User) => void;
  logout: () => void;
  authenticate: (email: string, password: string) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: (user) => set({ user, isAuthenticated: true, error: null }),
      
      logout: () => set({ user: null, isAuthenticated: false, error: null }),

      authenticate: async (email: string, password: string) => {
        set({ loading: true, error: null });
        
        try {
          console.log('🔐 Authenticating:', email); // DEBUG
          
          // Check if user exists in database
          const user = await userService.getUserByEmail(email);
          
          console.log('📋 User from DB:', user); // DEBUG
          
          if (!user) {
            console.log('❌ User not found in database'); // DEBUG
            set({ 
              loading: false, 
              error: 'Email tidak ditemukan' 
            });
            return false;
          }

          // Simple password check
          const isValidPassword = 
            (email === 'admin@kdju.com' && password === 'admin123') ||
            (email === 'staff@kdju.com' && password === 'staff123');

          console.log('🔑 Password valid:', isValidPassword); // DEBUG

          if (isValidPassword) {
            console.log('✅ Authentication successful'); // DEBUG
            set({ 
              user, 
              isAuthenticated: true, 
              loading: false, 
              error: null 
            });
            return true;
          }

          console.log('❌ Invalid password'); // DEBUG
          set({ 
            loading: false, 
            error: 'Password salah' 
          });
          return false;
        } catch (error) {
          console.error('💥 Authentication error:', error);
          set({ 
            loading: false, 
            error: 'Terjadi kesalahan saat login: ' + (error instanceof Error ? error.message : 'Unknown error') 
          });
          return false;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);