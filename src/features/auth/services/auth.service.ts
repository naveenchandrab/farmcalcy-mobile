import { apiClient } from '@api/axios';
import type { ApiResponse } from '@app-types';

import type {
  ChangePasswordApiRequest,
  ChangePasswordApiResponse,
  ForgotPasswordApiRequest,
  LoginApiRequest,
  LoginApiResponse,
  LogoutApiRequest,
  MessageResponse,
  ResetPasswordApiRequest,
} from '../types';

/**
 * Auth API calls. Every request goes through the shared `apiClient` so the
 * request interceptor attaches the Bearer token (where applicable) and the
 * response interceptor handles 401 / token refresh automatically.
 *
 * Unauthenticated flows (login, forgot/reset password) are listed in
 * AUTH_SKIP_ENDPOINTS so the interceptor never attaches an Authorization header.
 * `changePassword` is intentionally NOT skipped — it requires a valid session.
 */
export const authService = {
  /**
   * Authenticates with email + password.
   * Returns both JWT tokens and the user profile (incl. mustChangePassword).
   */
  async login(payload: LoginApiRequest): Promise<LoginApiResponse> {
    const { data } = await apiClient.post<ApiResponse<LoginApiResponse>>(
      '/auth/login',
      payload,
    );
    return data.data;
  },

  /**
   * Revokes the given refresh token server-side. Call on logout so the
   * session is invalidated backend-side, not just locally.
   */
  async logout(payload: LogoutApiRequest): Promise<void> {
    await apiClient.post('/auth/logout', payload);
  },

  /**
   * Starts the forgot-password flow. The backend always responds 200 to
   * prevent account enumeration, dispatching an OTP only if the email exists.
   */
  async forgotPassword(payload: ForgotPasswordApiRequest): Promise<MessageResponse> {
    const { data } = await apiClient.post<ApiResponse<MessageResponse>>(
      '/auth/forgot-password',
      payload,
    );
    return data.data;
  },

  /**
   * Completes the forgot-password flow. The backend verifies-and-consumes the
   * OTP, updates the password and revokes all active sessions.
   */
  async resetPassword(payload: ResetPasswordApiRequest): Promise<MessageResponse> {
    const { data } = await apiClient.post<ApiResponse<MessageResponse>>(
      '/auth/reset-password',
      payload,
    );
    return data.data;
  },

  /**
   * Changes the password for the authenticated user. Used for the forced
   * first-login change (mustChangePassword), where an OTP is required.
   * Returns fresh tokens — the previous session is revoked server-side.
   */
  async changePassword(
    payload: ChangePasswordApiRequest,
  ): Promise<ChangePasswordApiResponse> {
    const { data } = await apiClient.post<ApiResponse<ChangePasswordApiResponse>>(
      '/auth/change-password',
      payload,
    );
    return data.data;
  },
};
