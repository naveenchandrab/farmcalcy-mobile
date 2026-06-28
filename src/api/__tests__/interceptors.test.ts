import axios from 'axios';

import { AUTH_SKIP_ENDPOINTS } from '@constants';
import { TokenService } from '@services/TokenService';

import { setupInterceptors } from '../interceptors';

// Mock axios: the default export is callable (used to RETRY requests) and also
// carries `.post` (used to call /auth/refresh, bypassing the interceptor).
jest.mock('axios', () => {
  const fn = jest.fn();
  // @ts-expect-error augment the mock fn with a post method
  fn.post = jest.fn();
  return { __esModule: true, default: fn };
});

jest.mock('@services/TokenService', () => ({
  TokenService: {
    getAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
    saveTokens: jest.fn(),
    clearTokens: jest.fn(),
  },
}));

const mockAxios = axios as unknown as jest.Mock & { post: jest.Mock };
const mockToken = TokenService as jest.Mocked<typeof TokenService>;

/**
 * Captures the request/response handlers `setupInterceptors` registers so we can
 * invoke them directly — no real HTTP, full control over the 401 → refresh →
 * retry race and the refresh-failure → auto-logout path.
 */
const buildClient = () => {
  const requestUse = jest.fn();
  const responseUse = jest.fn();
  const client = {
    interceptors: {
      request: { use: requestUse },
      response: { use: responseUse },
    },
  } as never;

  setupInterceptors(client);

  return {
    requestFulfilled: requestUse.mock.calls[0][0] as (c: any) => Promise<any>,
    responseError: responseUse.mock.calls[0][1] as (e: any) => Promise<any>,
  };
};

const makeConfig = (url: string) => ({ url, method: 'get', headers: {} as Record<string, string> });

beforeEach(() => {
  jest.clearAllMocks();
});

describe('request interceptor', () => {
  it('attaches a Bearer token to authenticated requests', async () => {
    mockToken.getAccessToken.mockResolvedValueOnce('access-123');
    const { requestFulfilled } = buildClient();

    const config = await requestFulfilled(makeConfig('/users'));

    expect(config.headers.Authorization).toBe('Bearer access-123');
  });

  it.each(AUTH_SKIP_ENDPOINTS)('never attaches a token to %s', async url => {
    const { requestFulfilled } = buildClient();
    const config = await requestFulfilled(makeConfig(url));

    expect(config.headers.Authorization).toBeUndefined();
    expect(mockToken.getAccessToken).not.toHaveBeenCalled();
  });

  it('leaves the request unauthenticated when no token is stored', async () => {
    mockToken.getAccessToken.mockResolvedValueOnce(null);
    const { requestFulfilled } = buildClient();

    const config = await requestFulfilled(makeConfig('/users'));

    expect(config.headers.Authorization).toBeUndefined();
  });
});

describe('response interceptor — 401 handling', () => {
  it('passes through a non-401 error untouched', async () => {
    const { responseError } = buildClient();
    const error = { config: makeConfig('/users'), response: { status: 500 } };

    await expect(responseError(error)).rejects.toBe(error);
    expect(mockToken.getRefreshToken).not.toHaveBeenCalled();
  });

  it('refreshes the token and replays the original request on a 401', async () => {
    mockToken.getRefreshToken.mockResolvedValueOnce('refresh-1');
    mockAxios.post.mockResolvedValueOnce({
      data: { data: { accessToken: 'new-access', refreshToken: 'new-refresh' } },
    });
    mockAxios.mockResolvedValueOnce({ status: 200, data: 'retried' });

    const { responseError } = buildClient();
    const result = await responseError({
      config: makeConfig('/users'),
      response: { status: 401 },
    });

    // Refresh persisted, original request retried with the new token.
    expect(mockToken.saveTokens).toHaveBeenCalledWith({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });
    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer new-access' }),
      }),
    );
    expect(result).toEqual({ status: 200, data: 'retried' });
  });

  it('clears tokens (auto-logout) when the refresh itself fails', async () => {
    mockToken.getRefreshToken.mockResolvedValueOnce('refresh-1');
    mockAxios.post.mockRejectedValueOnce(new Error('refresh expired'));

    const { responseError } = buildClient();

    await expect(
      responseError({ config: makeConfig('/users'), response: { status: 401 } }),
    ).rejects.toThrow('refresh expired');
    expect(mockToken.clearTokens).toHaveBeenCalled();
  });

  it('does not attempt a refresh when the failing request IS the refresh endpoint', async () => {
    const { responseError } = buildClient();
    const error = { config: makeConfig('/auth/refresh'), response: { status: 401 } };

    await expect(responseError(error)).rejects.toBe(error);
    expect(mockToken.getRefreshToken).not.toHaveBeenCalled();
  });

  it.each(AUTH_SKIP_ENDPOINTS.filter(u => u !== '/auth/refresh'))(
    'propagates a 401 from auth endpoint %s without attempting a refresh',
    async url => {
      // Regression: a 401 from login/forgot/reset/otp is a real credential
      // failure, not an expired session. The interceptor must NOT swallow it
      // with a refresh attempt — callers rely on `error.response.status` to map
      // the friendly "email or password is incorrect" message.
      const { responseError } = buildClient();
      const error = { config: makeConfig(url), response: { status: 401 } };

      await expect(responseError(error)).rejects.toBe(error);
      expect(mockToken.getRefreshToken).not.toHaveBeenCalled();
      expect(mockToken.clearTokens).not.toHaveBeenCalled();
    },
  );

  it('clears tokens when there is no refresh token to use', async () => {
    mockToken.getRefreshToken.mockResolvedValueOnce(null);

    const { responseError } = buildClient();

    await expect(
      responseError({ config: makeConfig('/users'), response: { status: 401 } }),
    ).rejects.toBeDefined();
    expect(mockToken.clearTokens).toHaveBeenCalled();
  });

  it('queues concurrent 401s behind a single refresh and replays them all', async () => {
    mockToken.getRefreshToken.mockResolvedValue('refresh-1');
    // Make the refresh resolve only after both requests have queued.
    let resolveRefresh: (v: unknown) => void = () => {};
    mockAxios.post.mockReturnValueOnce(
      new Promise(resolve => {
        resolveRefresh = resolve;
      }),
    );
    // Both retried requests resolve once replayed.
    mockAxios.mockResolvedValue({ status: 200, data: 'retried' });

    const { responseError } = buildClient();

    const first = responseError({ config: makeConfig('/a'), response: { status: 401 } });
    const second = responseError({ config: makeConfig('/b'), response: { status: 401 } });

    // Let the second request observe isRefreshing === true and join the queue.
    await Promise.resolve();
    resolveRefresh({
      data: { data: { accessToken: 'new-access', refreshToken: 'new-refresh' } },
    });

    await expect(first).resolves.toEqual({ status: 200, data: 'retried' });
    await expect(second).resolves.toEqual({ status: 200, data: 'retried' });
    // Refresh happened exactly once for the two concurrent 401s.
    expect(mockAxios.post).toHaveBeenCalledTimes(1);
  });
});
