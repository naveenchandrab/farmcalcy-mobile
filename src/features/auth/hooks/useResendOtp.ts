import { useMutation } from '@tanstack/react-query';

import { extractErrorMessage } from '@services/ApiErrorMapper';
import { showError } from '@utils/toast';

import { otpService } from '../services/otp.service';
import { OtpPurpose } from '../types';
import type { MessageResponse, OtpPurpose as OtpPurposeType } from '../types';

const RESEND_ERROR_OVERRIDES: Partial<Record<number, string>> = {
  400: 'We could not send a new code. Please try again.',
  429: 'Please wait before requesting another code.',
};

/**
 * Resends an OTP for the given purpose (FORGOT_PASSWORD by default).
 * The backend invalidates any outstanding OTP before issuing the new one.
 */
export const useResendOtp = (purpose: OtpPurposeType = OtpPurpose.ForgotPassword) =>
  useMutation<MessageResponse, unknown, string>({
    mutationFn: async (email: string) =>
      otpService.send({ email: email.trim(), purpose }),
    onError: (error: unknown) => {
      showError(extractErrorMessage(error, RESEND_ERROR_OVERRIDES));
    },
  });
