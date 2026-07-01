import * as Keychain from 'react-native-keychain';

import type { AuthTokens } from '@app-types';
import { KEYCHAIN_SERVICE } from '@constants';

/**
 * The "username" field in Keychain is repurposed as a fixed key.
 * Keychain stores the payload under SERVICE + this identifier.
 */
const TOKEN_USERNAME = 'farmseasy_auth_tokens';

interface StoredTokenPayload {
  accessToken: string;
  refreshToken: string;
}

/**
 * Secure token storage backed by react-native-keychain.
 *
 * On iOS this writes to the Keychain with kSecAttrAccessibleAfterFirstUnlock.
 * On Android this uses the Android Keystore via EncryptedSharedPreferences.
 *
 * Never expose raw Keychain APIs outside this service.
 */
export const TokenService = {
  /**
   * Persists both JWT tokens to the secure store.
   * Call after a successful login or token refresh.
   */
  async saveTokens(tokens: AuthTokens): Promise<void> {
    const payload: StoredTokenPayload = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };

    await Keychain.setGenericPassword(TOKEN_USERNAME, JSON.stringify(payload), {
      service: KEYCHAIN_SERVICE,
      accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK,
    });
  },

  /**
   * Retrieves the stored access token, or null if none exists.
   */
  async getAccessToken(): Promise<string | null> {
    const result = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });
    if (!result) {
      return null;
    }
    const payload = JSON.parse(result.password) as StoredTokenPayload;
    return payload.accessToken ?? null;
  },

  /**
   * Retrieves the stored refresh token, or null if none exists.
   */
  async getRefreshToken(): Promise<string | null> {
    const result = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });
    if (!result) {
      return null;
    }
    const payload = JSON.parse(result.password) as StoredTokenPayload;
    return payload.refreshToken ?? null;
  },

  /**
   * Returns both tokens in one Keychain read — use this when you need both
   * (e.g. during auth store initialisation) to avoid two round-trips.
   */
  async getTokens(): Promise<AuthTokens | null> {
    const result = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });
    if (!result) {
      return null;
    }
    return JSON.parse(result.password) as AuthTokens;
  },

  /**
   * Returns true if at least one token is stored (user was previously logged in).
   * Does NOT validate the token's expiry — the interceptor handles that.
   */
  async isLoggedIn(): Promise<boolean> {
    const result = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });
    return result !== false;
  },

  /**
   * Removes all stored tokens from the secure store.
   * Call on logout or when refresh token rotation fails.
   */
  async clearTokens(): Promise<void> {
    await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
  },
};
