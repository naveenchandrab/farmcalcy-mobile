import { useMutation } from '@tanstack/react-query';

import { extractErrorMessage } from '@services/ApiErrorMapper';

import { otpService } from '../services/otp.service';
import { OtpPurpose } from '../types';
import type { MessageResponse, OtpPurpose as OtpPurposeType } from '../types';

/** Friendly copy for the statuses `/otp/verify` can return. */
const VERIFY_ERROR_OVERRIDES: Partial<Record<number, string>> = {
  400: 'No valid code found. Please request a new one.',
  401: 'The code you entered is incorrect. Please try again.',
};

/**
 * Validates an OTP up-front (without consuming it) so the UI can reject a wrong
 * code on the OTP screen instead of letting the user fill in a new password
 * first and only then discovering the code was invalid. The code is consumed
 * later at reset/change time.
 *
 * Error handling is left to the caller so the OTP screen can surface the message
 * inline and keep the user on the screen rather than navigating forward.
 */
export const useVerifyOtp = (purpose: OtpPurposeType = OtpPurpose.ForgotPassword) => {
  const mutation = useMutation<MessageResponse, unknown, { email: string; otp: string }>({
    mutationFn: async ({ email, otp }) =>
      otpService.verify({ email: email.trim(), otp, purpose }),
  });

  return {
    ...mutation,
    /** Maps any verify error to safe, user-facing copy. */
    getErrorMessage: (error: unknown) =>
      extractErrorMessage(error, VERIFY_ERROR_OVERRIDES),
  };
};
