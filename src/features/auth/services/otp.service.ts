import { apiClient } from '@api/axios';
import type { ApiResponse } from '@app-types';

import type {
  MessageResponse,
  SendOtpApiRequest,
  VerifyOtpApiRequest,
} from '../types';

/**
 * OTP API calls (POST /otp/*).
 *
 * `send` (re)issues an OTP for a given purpose. The backend always responds 200
 * for unknown emails (enumeration safe) and invalidates any outstanding OTP for
 * the same email+purpose before issuing a new one.
 *
 * `verify` validates a code WITHOUT consuming it, so the UI can reject a wrong
 * OTP up-front (before showing the reset form). The code is consumed only later,
 * at `/auth/reset-password` (or `/auth/change-password`) time.
 */
export const otpService = {
  async send(payload: SendOtpApiRequest): Promise<MessageResponse> {
    const { data } = await apiClient.post<ApiResponse<MessageResponse>>(
      '/otp/send',
      payload,
    );
    return data.data;
  },

  async verify(payload: VerifyOtpApiRequest): Promise<MessageResponse> {
    const { data } = await apiClient.post<ApiResponse<MessageResponse>>(
      '/otp/verify',
      payload,
    );
    return data.data;
  },
};
