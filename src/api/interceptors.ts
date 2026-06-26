import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

import { appConfig } from '@config/env';
import { AUTH_SKIP_ENDPOINTS, REFRESH_TOKEN_ENDPOINT } from '@constants';
import { TokenService } from '@services/TokenService';
import type { ApiResponse, RefreshTokenResponse } from '@app-types';

// ─── Refresh Token Queue ──────────────────────────────────────────────────────
//
// Enterprise-grade race condition guard:
// Only one /auth/refresh call runs at a time. All 401 responses that arrive
// while a refresh is in flight are queued as promise callbacks. Once the
// refresh resolves they are replayed with the new token; if it rejects they
// all reject together, triggering a single logout.

type QueueEntry = {
  resolve: (token: string) => void;
  reject: (reason: unknown) => void;
};

let isRefreshing = false;
let refreshQueue: QueueEntry[] = [];

/** Drains the queue, either replaying all queued requests or rejecting them. */
const drainQueue = (error: unknown, newToken: string | null): void => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (newToken) {
      resolve(newToken);
    }
  });
  refreshQueue = [];
};

/** Waits for the ongoing refresh and returns the new access token. */
const waitForRefresh = (): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    refreshQueue.push({ resolve, reject });
  });

// ─── Helpers ─────────────────────────────────────────────────────────────────

const shouldSkipAuth = (url: string | undefined): boolean => {
  if (!url) {
    return false;
  }
  return AUTH_SKIP_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

const attachBearer = (
  config: InternalAxiosRequestConfig,
  token: string,
): InternalAxiosRequestConfig => {
  config.headers.Authorization = `Bearer ${token}`;
  return config;
};

// ─── Request Interceptor ──────────────────────────────────────────────────────

const requestFulfilled = async (
  config: InternalAxiosRequestConfig,
): Promise<InternalAxiosRequestConfig> => {
  if (appConfig.isDev) {
    console.warn(`[API →] ${config.method?.toUpperCase()} ${config.url}`);
  }

  if (shouldSkipAuth(config.url)) {
    return config;
  }

  const accessToken = await TokenService.getAccessToken();
  if (accessToken) {
    return attachBearer(config, accessToken);
  }

  return config;
};

// ─── Response Interceptor ────────────────────────────────────────────────────

/**
 * Handles 401 Unauthorized responses.
 *
 * Flow:
 *  1. If a refresh is already in-flight → join the queue and wait.
 *  2. Otherwise → start a refresh, drain the queue on success or failure.
 *  3. Retry the original request with the new access token.
 *  4. If refresh fails → clear tokens and propagate the error
 *     (AuthStore listener will navigate to Login).
 */
const responseError = async (error: AxiosError): Promise<unknown> => {
  const originalRequest = error.config as InternalAxiosRequestConfig & {
    _retry?: boolean;
  };

  const is401 = error.response?.status === 401;
  const isRefreshEndpoint = originalRequest?.url?.includes(REFRESH_TOKEN_ENDPOINT);

  // Not a 401, or it's the refresh endpoint itself failing → bail out
  if (!is401 || isRefreshEndpoint || originalRequest._retry) {
    if (appConfig.isDev && error.response) {
      console.warn(
        `[API ←] ${error.response.status} ${originalRequest?.url}`,
        error.response.data,
      );
    }
    return Promise.reject(error);
  }

  // Another refresh is already running — queue this request
  if (isRefreshing) {
    try {
      const newToken = await waitForRefresh();
      originalRequest._retry = true;
      return await axios(attachBearer(originalRequest, newToken));
    } catch (queueError) {
      return Promise.reject(queueError);
    }
  }

  // This request starts the refresh
  originalRequest._retry = true;
  isRefreshing = true;

  try {
    const refreshToken = await TokenService.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Use a bare axios call to bypass this interceptor
    const { data } = await axios.post<ApiResponse<RefreshTokenResponse>>(
      `${appConfig.BASE_URL}${REFRESH_TOKEN_ENDPOINT}`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    );

    const { accessToken, refreshToken: newRefreshToken } = data.data;

    await TokenService.saveTokens({ accessToken, refreshToken: newRefreshToken });

    drainQueue(null, accessToken);
    isRefreshing = false;

    return await axios(attachBearer(originalRequest, accessToken));
  } catch (refreshError) {
    drainQueue(refreshError, null);
    isRefreshing = false;

    await TokenService.clearTokens();

    // Notify the auth store via a custom event so the NavigationContainer
    // can redirect to Login without a direct import cycle.
    // AuthStore subscribes to this in its `initialize` method.
    refreshQueue = [];

    return Promise.reject(refreshError);
  }
};

// ─── Setup ───────────────────────────────────────────────────────────────────

/**
 * Attaches request and response interceptors to the provided Axios instance.
 * Call once at application startup (App.tsx) before any API requests are made.
 */
export const setupInterceptors = (client: AxiosInstance): void => {
  client.interceptors.request.use(
    config => requestFulfilled(config),
    (error: unknown) => Promise.reject(error),
  );

  client.interceptors.response.use(
    response => {
      if (appConfig.isDev) {
        console.warn(`[API ←] ${response.status} ${response.config.url}`);
      }
      return response;
    },
    (error: AxiosError) => responseError(error),
  );
};
