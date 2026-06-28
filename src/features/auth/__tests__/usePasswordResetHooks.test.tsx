import { waitFor } from '@testing-library/react-native';

import {
  httpError,
  networkError,
  renderHookWithProviders,
  timeoutError,
} from '@test-utils';
import { showError } from '@utils/toast';

import { useForgotPassword } from '../hooks/useForgotPassword';
import { useResendOtp } from '../hooks/useResendOtp';
import { useResetPassword } from '../hooks/useResetPassword';
import { authService } from '../services/auth.service';
import { otpService } from '../services/otp.service';

jest.mock('../services/auth.service', () => ({
  authService: { forgotPassword: jest.fn(), resetPassword: jest.fn() },
}));
jest.mock('../services/otp.service', () => ({
  otpService: { send: jest.fn() },
}));

const mockForgot = authService.forgotPassword as jest.Mock;
const mockReset = authService.resetPassword as jest.Mock;
const mockSend = otpService.send as jest.Mock;

describe('useForgotPassword', () => {
  it('requests an OTP and trims the email', async () => {
    mockForgot.mockResolvedValueOnce({ message: 'ok' });

    const { result } = renderHookWithProviders(() => useForgotPassword());
    result.current.mutate('  rajesh@abcpoultry.com  ');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockForgot).toHaveBeenCalledWith({ email: 'rajesh@abcpoultry.com' });
  });

  it('shows a rate-limit toast on 429', async () => {
    mockForgot.mockRejectedValueOnce(httpError(429));

    const { result } = renderHookWithProviders(() => useForgotPassword());
    result.current.mutate('rajesh@abcpoultry.com');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(showError).toHaveBeenCalledWith(
      'Too many requests. Please wait a moment before trying again.',
    );
  });

  it('surfaces a connectivity toast on a network error', async () => {
    mockForgot.mockRejectedValueOnce(networkError());

    const { result } = renderHookWithProviders(() => useForgotPassword());
    result.current.mutate('rajesh@abcpoultry.com');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(showError).toHaveBeenCalledWith(expect.stringMatching(/internet connection/i));
  });
});

describe('useResendOtp', () => {
  it('sends a FORGOT_PASSWORD OTP by default', async () => {
    mockSend.mockResolvedValueOnce({ message: 'ok' });

    const { result } = renderHookWithProviders(() => useResendOtp());
    result.current.mutate('rajesh@abcpoultry.com');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockSend).toHaveBeenCalledWith({
      email: 'rajesh@abcpoultry.com',
      purpose: 'FORGOT_PASSWORD',
    });
  });

  it('shows the cooldown toast on 429', async () => {
    mockSend.mockRejectedValueOnce(httpError(429));

    const { result } = renderHookWithProviders(() => useResendOtp());
    result.current.mutate('rajesh@abcpoultry.com');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(showError).toHaveBeenCalledWith('Please wait before requesting another code.');
  });
});

describe('useResetPassword', () => {
  const payload = {
    email: 'rajesh@abcpoultry.com',
    otp: '123456',
    newPassword: 'NewPass123',
    confirmPassword: 'NewPass123',
  };

  it('resolves on a successful reset', async () => {
    mockReset.mockResolvedValueOnce({ message: 'Password updated.' });

    const { result } = renderHookWithProviders(() => useResetPassword());
    result.current.mutate(payload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockReset).toHaveBeenCalledWith(payload);
  });

  it('does NOT auto-toast — the screen owns error branching (OTP vs policy)', async () => {
    mockReset.mockRejectedValueOnce(httpError(401));

    const { result } = renderHookWithProviders(() => useResetPassword());
    result.current.mutate(payload);

    await waitFor(() => expect(result.current.isError).toBe(true));
    // The hook deliberately has no onError; the caller inspects the status.
    expect(result.current.error).toMatchObject({ response: { status: 401 } });
  });

  it('exposes a timeout error to the caller', async () => {
    mockReset.mockRejectedValueOnce(timeoutError());

    const { result } = renderHookWithProviders(() => useResetPassword());
    result.current.mutate(payload);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect((result.current.error as { code?: string }).code).toBe('ECONNABORTED');
  });
});
