import { useMutation } from '@tanstack/react-query';

import { useAuthStore } from '@store/authStore';

import { authService } from '../services/auth.service';
import type { ChangePasswordApiRequest, ChangePasswordApiResponse } from '../types';

/**
 * Change-password mutation for the forced first-login flow.
 *
 * Requires an authenticated session (the temporary tokens stored after a
 * mustChangePassword login) plus an OTP with purpose=PASSWORD_CHANGE. On
 * success the backend returns fresh tokens and clears mustChangePassword;
 * `completeForcedPasswordChange` then grants access and the navigator swaps
 * to the app stack.
 *
 * As with reset, the caller inspects the error status to distinguish an OTP
 * failure from a wrong current-password / policy failure.
 */
export const useChangePassword = () => {
  const completeForcedPasswordChange = useAuthStore(
    state => state.completeForcedPasswordChange,
  );

  return useMutation<ChangePasswordApiResponse, unknown, ChangePasswordApiRequest>({
    mutationFn: async (payload: ChangePasswordApiRequest) =>
      authService.changePassword(payload),
    onSuccess: async response => {
      await completeForcedPasswordChange({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
    },
  });
};
