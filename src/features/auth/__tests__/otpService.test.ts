import { apiClient } from '@api/axios';
import { axiosResponse } from '@test-utils';

import { otpService } from '../services/otp.service';
import { OtpPurpose } from '../types';

jest.mock('@api/axios', () => ({
  __esModule: true,
  apiClient: { post: jest.fn() },
  default: { post: jest.fn() },
}));

const mockPost = apiClient.post as jest.Mock;

describe('otpService', () => {
  it('POSTs email + purpose to /otp/send and unwraps the message', async () => {
    mockPost.mockResolvedValueOnce(axiosResponse({ message: 'Code sent.' }));

    const result = await otpService.send({
      email: 'rajesh@abcpoultry.com',
      purpose: OtpPurpose.ForgotPassword,
    });

    expect(mockPost).toHaveBeenCalledWith('/otp/send', {
      email: 'rajesh@abcpoultry.com',
      purpose: 'FORGOT_PASSWORD',
    });
    expect(result.message).toBe('Code sent.');
  });

  it('supports the PASSWORD_CHANGE purpose', async () => {
    mockPost.mockResolvedValueOnce(axiosResponse({ message: 'Code sent.' }));
    await otpService.send({ email: 'a@b.com', purpose: OtpPurpose.PasswordChange });
    expect(mockPost).toHaveBeenCalledWith(
      '/otp/send',
      expect.objectContaining({ purpose: 'PASSWORD_CHANGE' }),
    );
  });
});
