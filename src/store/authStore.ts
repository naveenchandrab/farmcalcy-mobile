import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import type { AuthTokens, User } from '@app-types';
import { STORAGE_KEY_USER } from '@constants';
import { TokenService } from '@services/TokenService';

interface AuthState {
  /** Authenticated user profile. Null when logged out. */
  user: User | null;

  /** True once tokens have been checked at startup — guards against flashing LoginScreen. */
  isInitializing: boolean;

  /** Derived from token presence + password state — do NOT set directly. */
  isAuthenticated: boolean;

  /**
   * True when the user has valid tokens but must complete a forced password
   * change before being granted access (login returned mustChangePassword).
   * The session tokens are persisted so /auth/change-password can be called,
   * but `isAuthenticated` stays false until the change succeeds.
   */
  mustChangePassword: boolean;

  /**
   * Reads tokens + user from secure storage at startup and restores session
   * state without hitting the network. Honours mustChangePassword so a forced
   * change cannot be bypassed by restarting the app.
   */
  initialize: () => Promise<void>;

  /**
   * Completes a normal login. Persists tokens + user and grants access.
   */
  login: (user: User, tokens: AuthTokens) => Promise<void>;

  /**
   * Persists the session after a login whose user must change their password.
   * Stores tokens (so change-password can authenticate) but withholds access.
   */
  beginForcedPasswordChange: (user: User, tokens: AuthTokens) => Promise<void>;

  /**
   * Finalises a forced password change: stores the new tokens, clears the
   * mustChangePassword flag and grants access.
   */
  completeForcedPasswordChange: (tokens: AuthTokens) => Promise<void>;

  /** Clears all local state and storage (logout, or abandoning a forced change). */
  logout: () => Promise<void>;

  /** Updates the cached user profile (e.g. after an edit-profile response). */
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isInitializing: true,
  isAuthenticated: false,
  mustChangePassword: false,

  initialize: async () => {
    try {
      const [hasTokens, storedUser] = await Promise.all([
        TokenService.isLoggedIn(),
        AsyncStorage.getItem(STORAGE_KEY_USER),
      ]);

      if (hasTokens && storedUser) {
        const user = JSON.parse(storedUser) as User;
        if (user.mustChangePassword) {
          // Valid session, but access is withheld until the password is changed.
          set({ user, isAuthenticated: false, mustChangePassword: true });
        } else {
          set({ user, isAuthenticated: true, mustChangePassword: false });
        }
      } else {
        // Partial state (token without user or vice versa) — treat as logged out.
        await Promise.all([
          TokenService.clearTokens(),
          AsyncStorage.removeItem(STORAGE_KEY_USER),
        ]);
        set({ user: null, isAuthenticated: false, mustChangePassword: false });
      }
    } catch {
      // Storage read failure — default to logged out; do not crash the app.
      set({ user: null, isAuthenticated: false, mustChangePassword: false });
    } finally {
      set({ isInitializing: false });
    }
  },

  login: async (user: User, tokens: AuthTokens) => {
    await Promise.all([
      TokenService.saveTokens(tokens),
      AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user)),
    ]);
    set({ user, isAuthenticated: true, mustChangePassword: false });
  },

  beginForcedPasswordChange: async (user: User, tokens: AuthTokens) => {
    await Promise.all([
      TokenService.saveTokens(tokens),
      AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user)),
    ]);
    set({ user, isAuthenticated: false, mustChangePassword: true });
  },

  completeForcedPasswordChange: async (tokens: AuthTokens) => {
    const current = get().user;
    const updatedUser: User | null = current
      ? { ...current, mustChangePassword: false }
      : null;

    await TokenService.saveTokens(tokens);
    if (updatedUser) {
      await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
    }

    set({ user: updatedUser, isAuthenticated: true, mustChangePassword: false });
  },

  logout: async () => {
    await Promise.all([
      TokenService.clearTokens(),
      AsyncStorage.removeItem(STORAGE_KEY_USER),
    ]);
    set({ user: null, isAuthenticated: false, mustChangePassword: false });
  },

  setUser: (user: User) => {
    void AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    set({ user });
  },
}));
