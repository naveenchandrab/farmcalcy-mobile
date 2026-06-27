import { useMutation } from '@tanstack/react-query';

import { extractErrorMessage } from '@services/ApiErrorMapper';
import { showError } from '@utils/toast';

import { authService } from '../services/auth.service';
import type { MessageResponse } from '../types';

const FORGOT_ERROR_OVERRIDES: Partial<Record<number, string>> = {
  400: 'Please enter a valid email address.',
  429: 'Too many requests. Please wait a moment before trying again.',
};

/**
 * Forgot-password mutation: requests an OTP for the given email.
 *
 * The backend always responds 200 (enumeration safe), so a resolved promise
 * does not confirm the email exists — the OTP screen messaging reflects that.
 */
export const useForgotPassword = () =>
  useMutation<MessageResponse, unknown, string>({
    mutationFn: async (email: string) =>
      authService.forgotPassword({ email: email.trim() }),
    onError: (error: unknown) => {
      showError(extractErrorMessage(error, FORGOT_ERROR_OVERRIDES));
    },
  });
