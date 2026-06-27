import { apiClient } from '@api/axios';
import type { ApiResponse } from '@app-types';

import type { MessageResponse, SendOtpApiRequest } from '../types';

/**
 * OTP API calls (POST /otp/*).
 *
 * `send` is used to (re)issue an OTP for a given purpose. The backend always
 * responds 200 for unknown emails (enumeration safe) and invalidates any
 * outstanding OTP for the same email+purpose before issuing a new one.
 *
 * Note: there is a `/otp/verify` endpoint, but it CONSUMES the OTP (single use).
 * The forgot-password flow therefore does not call it — the OTP is verified and
 * consumed once at `/auth/reset-password` time instead.
 */
export const otpService = {
  async send(payload: SendOtpApiRequest): Promise<MessageResponse> {
    const { data } = await apiClient.post<ApiResponse<MessageResponse>>(
      '/otp/send',
      payload,
    );
    return data.data;
  },
};
