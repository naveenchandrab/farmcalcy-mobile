import { useMutation } from '@tanstack/react-query';

import { authService } from '../services/auth.service';
import type { MessageResponse, ResetPasswordApiRequest } from '../types';

/**
 * Reset-password mutation: verifies-and-consumes the OTP and sets the new
 * password. All active sessions are revoked server-side, so the user must log
 * in again afterwards.
 *
 * Error handling is intentionally left to the caller: the reset screen needs to
 * distinguish an OTP failure (401 / 400 → send the user back to re-enter the
 * code) from a password-policy failure, so it inspects the error status itself.
 */
export const useResetPassword = () =>
  useMutation<MessageResponse, unknown, ResetPasswordApiRequest>({
    mutationFn: async (payload: ResetPasswordApiRequest) =>
      authService.resetPassword(payload),
  });
