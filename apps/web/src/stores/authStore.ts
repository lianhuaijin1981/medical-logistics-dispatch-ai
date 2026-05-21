import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, LoginResult, getToken, setToken, removeToken, setStoredUser, getStoredUser, setupAxiosInterceptors } from '../services/authService';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (result: LoginResult) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: (result: LoginResult) => {
        setToken(result.accessToken);
        setStoredUser(result.user);
        set({
          token: result.accessToken,
          user: result.user,
          isAuthenticated: true,
          error: null,
        });
      },

      logout: () => {
        removeToken();
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setLoading: (isLoading: boolean) => set({ isLoading }),

      setError: (error: string | null) => set({ error }),

      initAuth: () => {
        const token = getToken();
        const user = getStoredUser();
        if (token && user) {
          set({
            token,
            user,
            isAuthenticated: true,
          });
        }
      },
    }),
    {
      name: 'med-logistics-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// Setup axios interceptors on app start
setupAxiosInterceptors();
