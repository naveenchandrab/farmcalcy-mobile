import * as Keychain from 'react-native-keychain';

import { makeTokens } from '@test-utils';

import { TokenService } from '../TokenService';

/**
 * TokenService is the ONLY gateway to the secure store. These tests run against
 * the in-memory Keychain mock (jest.setup) and verify the round-trip plus the
 * "no tokens" branches that guard logged-out state.
 */
describe('TokenService', () => {
  it('saves both tokens to the keychain under the configured service', async () => {
    await TokenService.saveTokens(makeTokens());

    expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
      'farmcalcy_auth_tokens',
      JSON.stringify({ accessToken: 'access-token-abc123', refreshToken: 'refresh-token-xyz789' }),
      expect.objectContaining({ service: 'com.farmcalcy.pcfms' }),
    );
  });

  it('reads back the access token after saving', async () => {
    await TokenService.saveTokens(makeTokens({ accessToken: 'AAA' }));
    await expect(TokenService.getAccessToken()).resolves.toBe('AAA');
  });

  it('reads back the refresh token after saving', async () => {
    await TokenService.saveTokens(makeTokens({ refreshToken: 'RRR' }));
    await expect(TokenService.getRefreshToken()).resolves.toBe('RRR');
  });

  it('returns both tokens in a single read', async () => {
    await TokenService.saveTokens(makeTokens());
    await expect(TokenService.getTokens()).resolves.toEqual(makeTokens());
  });

  it('reports logged-in only when tokens exist', async () => {
    await expect(TokenService.isLoggedIn()).resolves.toBe(false);
    await TokenService.saveTokens(makeTokens());
    await expect(TokenService.isLoggedIn()).resolves.toBe(true);
  });

  it('returns null for the access token when nothing is stored', async () => {
    await expect(TokenService.getAccessToken()).resolves.toBeNull();
  });

  it('clears tokens on logout', async () => {
    await TokenService.saveTokens(makeTokens());
    await TokenService.clearTokens();

    expect(Keychain.resetGenericPassword).toHaveBeenCalled();
    await expect(TokenService.isLoggedIn()).resolves.toBe(false);
    await expect(TokenService.getTokens()).resolves.toBeNull();
  });
});
