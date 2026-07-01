import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEY_USER } from '@constants';
import { TokenService } from '@services/TokenService';
import { makeTokens, makeUser } from '@test-utils';

import { useAuthStore } from '../authStore';

/**
 * The auth store is the source of truth the RootNavigator switches on. These
 * tests drive the REAL store against the in-memory Keychain + AsyncStorage
 * mocks, covering session creation, the forced-password-change sub-flow, logout
 * cleanup and the startup `initialize` restore-or-purge logic.
 */
const reset = async () => {
  await AsyncStorage.clear();
  await TokenService.clearTokens();
  useAuthStore.setState({
    user: null,
    isInitializing: true,
    isAuthenticated: false,
    mustChangePassword: false,
  });
};

beforeEach(reset);

describe('login', () => {
  it('persists tokens + user and grants access', async () => {
    const user = makeUser();
    await useAuthStore.getState().login(user, makeTokens());

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.mustChangePassword).toBe(false);
    expect(state.user).toEqual(user);
    await expect(TokenService.isLoggedIn()).resolves.toBe(true);
    await expect(AsyncStorage.getItem(STORAGE_KEY_USER)).resolves.toBe(JSON.stringify(user));
  });
});

describe('forced password change sub-flow', () => {
  it('beginForcedPasswordChange stores the session but withholds access', async () => {
    const user = makeUser({ mustChangePassword: true });
    await useAuthStore.getState().beginForcedPasswordChange(user, makeTokens());

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.mustChangePassword).toBe(true);
    await expect(TokenService.isLoggedIn()).resolves.toBe(true);
  });

  it('completeForcedPasswordChange swaps tokens, clears the flag and grants access', async () => {
    const user = makeUser({ mustChangePassword: true });
    await useAuthStore.getState().beginForcedPasswordChange(user, makeTokens());

    await useAuthStore
      .getState()
      .completeForcedPasswordChange(makeTokens({ accessToken: 'fresh', refreshToken: 'fresh-r' }));

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.mustChangePassword).toBe(false);
    expect(state.user?.mustChangePassword).toBe(false);
    await expect(TokenService.getAccessToken()).resolves.toBe('fresh');
  });

  it('enterForcedPasswordChange revokes access when the API returns PASSWORD_CHANGE_REQUIRED', async () => {
    // Start as a normal authenticated user.
    await useAuthStore.getState().login(makeUser({ mustChangePassword: false }), makeTokens());
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    // Backend 403 PASSWORD_CHANGE_REQUIRED → app forces the change-password flow.
    useAuthStore.getState().enterForcedPasswordChange();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.mustChangePassword).toBe(true);
    expect(state.user?.mustChangePassword).toBe(true);
    // Session tokens are retained so /auth/change-password can authenticate.
    await expect(TokenService.isLoggedIn()).resolves.toBe(true);
  });

  it('enterForcedPasswordChange is a no-op when logged out', () => {
    useAuthStore.getState().enterForcedPasswordChange();
    expect(useAuthStore.getState().mustChangePassword).toBe(false);
  });
});

describe('logout', () => {
  it('clears local state and secure storage', async () => {
    await useAuthStore.getState().login(makeUser(), makeTokens());
    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    await expect(TokenService.isLoggedIn()).resolves.toBe(false);
    await expect(AsyncStorage.getItem(STORAGE_KEY_USER)).resolves.toBeNull();
  });
});

describe('setUser', () => {
  it('updates the cached profile and persists it', () => {
    const user = makeUser({ name: 'Updated Name' });
    useAuthStore.getState().setUser(user);
    expect(useAuthStore.getState().user?.name).toBe('Updated Name');
  });
});

describe('initialize (app restart)', () => {
  it('restores an authenticated session from valid tokens + user', async () => {
    const user = makeUser();
    await TokenService.saveTokens(makeTokens());
    await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));

    await useAuthStore.getState().initialize();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.isInitializing).toBe(false);
    expect(state.user?.email).toBe(user.email);
  });

  it('restores a forced-change session without granting access', async () => {
    const user = makeUser({ mustChangePassword: true });
    await TokenService.saveTokens(makeTokens());
    await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));

    await useAuthStore.getState().initialize();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.mustChangePassword).toBe(true);
    expect(state.isInitializing).toBe(false);
  });

  it('treats a token without a stored user as logged out and purges it', async () => {
    await TokenService.saveTokens(makeTokens()); // token but no user record

    await useAuthStore.getState().initialize();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    // Partial state must be purged so it cannot half-restore next launch.
    await expect(TokenService.isLoggedIn()).resolves.toBe(false);
  });

  it('stays logged out when there are no tokens at all', async () => {
    await useAuthStore.getState().initialize();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isInitializing).toBe(false);
  });

  it('defaults to logged out (and does not throw) when storage is corrupt', async () => {
    await TokenService.saveTokens(makeTokens());
    await AsyncStorage.setItem(STORAGE_KEY_USER, '{ not json');

    await expect(useAuthStore.getState().initialize()).resolves.toBeUndefined();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isInitializing).toBe(false);
  });
});
