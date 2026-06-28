import { apiClient } from '@api/axios';
import {
  axiosResponse,
  httpError,
  makeChangePasswordResponse,
  makeLoginResponse,
} from '@test-utils';

import { authService } from '../services/auth.service';

// Replace the shared Axios instance with a jest mock so no network is touched.
jest.mock('@api/axios', () => ({
  __esModule: true,
  apiClient: { post: jest.fn() },
  default: { post: jest.fn() },
}));

const mockPost = apiClient.post as jest.Mock;

/**
 * authService is a thin contract layer over the backend. The tests assert it
 * (a) hits the right endpoint with the right body, and (b) unwraps the
 * `{ data: { data } }` envelope the NestJS API returns.
 */
describe('authService', () => {
  describe('login', () => {
    it('POSTs to /auth/login and returns the unwrapped envelope', async () => {
      const response = makeLoginResponse();
      mockPost.mockResolvedValueOnce(axiosResponse(response));

      const result = await authService.login({
        email: 'rajesh@abcpoultry.com',
        password: 'Password123',
      });

      expect(mockPost).toHaveBeenCalledWith('/auth/login', {
        email: 'rajesh@abcpoultry.com',
        password: 'Password123',
      });
      expect(result).toEqual(response);
    });

    it('propagates a 401 from the server', async () => {
      mockPost.mockRejectedValueOnce(httpError(401));
      await expect(
        authService.login({ email: 'x@y.com', password: 'Password123' }),
      ).rejects.toMatchObject({ response: { status: 401 } });
    });
  });

  describe('logout', () => {
    it('POSTs the refresh token to /auth/logout', async () => {
      mockPost.mockResolvedValueOnce({ data: {} });
      await authService.logout({ refreshToken: 'r1' });
      expect(mockPost).toHaveBeenCalledWith('/auth/logout', { refreshToken: 'r1' });
    });
  });

  describe('forgotPassword', () => {
    it('POSTs the email to /auth/forgot-password and returns the message', async () => {
      mockPost.mockResolvedValueOnce(axiosResponse({ message: 'If registered, a code was sent.' }));

      const result = await authService.forgotPassword({ email: 'rajesh@abcpoultry.com' });

      expect(mockPost).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'rajesh@abcpoultry.com',
      });
      expect(result.message).toMatch(/code was sent/i);
    });
  });

  describe('resetPassword', () => {
    it('POSTs the full reset payload to /auth/reset-password', async () => {
      mockPost.mockResolvedValueOnce(axiosResponse({ message: 'Password updated.' }));
      const payload = {
        email: 'rajesh@abcpoultry.com',
        otp: '123456',
        newPassword: 'NewPass123',
        confirmPassword: 'NewPass123',
      };

      await authService.resetPassword(payload);

      expect(mockPost).toHaveBeenCalledWith('/auth/reset-password', payload);
    });
  });

  describe('changePassword', () => {
    it('POSTs to /auth/change-password and returns fresh tokens', async () => {
      const tokens = makeChangePasswordResponse();
      mockPost.mockResolvedValueOnce(axiosResponse(tokens));

      const result = await authService.changePassword({
        currentPassword: 'OldPass123',
        newPassword: 'NewPass123',
        confirmPassword: 'NewPass123',
        otp: '123456',
      });

      expect(mockPost).toHaveBeenCalledWith(
        '/auth/change-password',
        expect.objectContaining({ otp: '123456' }),
      );
      expect(result).toEqual(tokens);
    });
  });
});
