import { apiClient } from '@api/axios';
import type { ApiResponse, LoginResponse } from '@app-types';

import type { LoginApiRequest, LogoutApiRequest } from '../types';

/**
 * Auth API calls. All network calls go through apiClient so the
 * request interceptor attaches the Bearer token and the response
 * interceptor handles 401 / token refresh automatically.
 *
 * Login and refresh calls skip Bearer injection (see AUTH_SKIP_ENDPOINTS
 * in constants/index.ts).
 */
export const authService = {
  /**
   * Authenticates the user with email + password.
   * Returns the user profile and both JWT tokens.
   */
  async login(payload: LoginApiRequest): Promise<ApiResponse<LoginResponse>> {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      payload,
    );
    return data;
  },

  /**
   * Invalidates the refresh token on the server.
   * Always call this on logout so the session is revoked backend-side.
   */
  async logout(payload: LogoutApiRequest): Promise<void> {
    await apiClient.post('/auth/logout', payload);
  },
};
