import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { STORAGE_KEY_USER } from '@constants';
import { TokenService } from '@services/TokenService';
import type { AuthTokens, User } from '@app-types';

interface AuthState {
  /** Authenticated user profile. Null when logged out. */
  user: User | null;

  /** True once tokens have been checked at startup — guards against flashing LoginScreen. */
  isInitializing: boolean;

  /** Derived from token presence — do NOT set directly. */
  isAuthenticated: boolean;

  /**
   * Called once at App.tsx mount. Reads tokens + user from secure storage
   * and restores session state without hitting the network.
   * The first API call will validate the token via the response interceptor.
   */
  initialize: () => Promise<void>;

  /**
   * Called after a successful login response.
   * Persists tokens to Keychain and user to AsyncStorage.
   */
  login: (user: User, tokens: AuthTokens) => Promise<void>;

  /**
   * Called on logout. Clears all local state and storage.
   * The caller is responsible for navigating to the Auth stack.
   */
  logout: () => Promise<void>;

  /** Updates the cached user profile (e.g. after an edit-profile response). */
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isInitializing: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const [hasTokens, storedUser] = await Promise.all([
        TokenService.isLoggedIn(),
        AsyncStorage.getItem(STORAGE_KEY_USER),
      ]);

      if (hasTokens && storedUser) {
        const user = JSON.parse(storedUser) as User;
        set({ user, isAuthenticated: true });
      } else {
        // Partial state (token without user or vice versa) — treat as logged out
        await Promise.all([TokenService.clearTokens(), AsyncStorage.removeItem(STORAGE_KEY_USER)]);
        set({ user: null, isAuthenticated: false });
      }
    } catch {
      // Storage read failure — default to logged out; do not crash the app
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isInitializing: false });
    }
  },

  login: async (user: User, tokens: AuthTokens) => {
    await Promise.all([
      TokenService.saveTokens(tokens),
      AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user)),
    ]);
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await Promise.all([TokenService.clearTokens(), AsyncStorage.removeItem(STORAGE_KEY_USER)]);
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user: User) => {
    void AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    set({ user });
  },
}));
