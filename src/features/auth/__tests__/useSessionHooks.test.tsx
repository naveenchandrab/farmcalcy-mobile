import { waitFor } from '@testing-library/react-native';

import { queryClient } from '@services/queryClient';
import { TokenService } from '@services/TokenService';
import { useAuthStore } from '@store/authStore';
import {
  httpError,
  makeChangePasswordResponse,
  makeTokens,
  makeUser,
  renderHookWithProviders,
} from '@test-utils';

import { useChangePassword } from '../hooks/useChangePassword';
import { useLogout } from '../hooks/useLogout';
import { authService } from '../services/auth.service';

jest.mock('../services/auth.service', () => ({
  authService: { changePassword: jest.fn(), logout: jest.fn() },
}));

const mockChange = authService.changePassword as jest.Mock;
const mockLogout = authService.logout as jest.Mock;

const resetStore = () =>
  useAuthStore.setState({
    user: null,
    isInitializing: false,
    isAuthenticated: false,
    mustChangePassword: false,
  });

beforeEach(async () => {
  resetStore();
  await TokenService.clearTokens();
});

describe('useChangePassword (forced first-login)', () => {
  const payload = {
    currentPassword: 'OldPass123',
    newPassword: 'NewPass123',
    confirmPassword: 'NewPass123',
    otp: '123456',
  };

  it('completes the forced change: stores fresh tokens and grants access', async () => {
    // Arrange: a session that still needs a password change.
    const user = makeUser({ mustChangePassword: true });
    await useAuthStore.getState().beginForcedPasswordChange(user, makeTokens());
    mockChange.mockResolvedValueOnce(
      makeChangePasswordResponse({ accessToken: 'fresh', refreshToken: 'fresh-r' }),
    );

    const { result } = renderHookWithProviders(() => useChangePassword());
    result.current.mutate(payload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.mustChangePassword).toBe(false);
    await expect(TokenService.getAccessToken()).resolves.toBe('fresh');
  });

  it('leaves the caller to handle a wrong current-password / OTP failure', async () => {
    mockChange.mockRejectedValueOnce(httpError(401));

    const { result } = renderHookWithProviders(() => useChangePassword());
    result.current.mutate(payload);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});

describe('useLogout', () => {
  it('revokes the refresh token server-side, clears the query cache and logs out locally', async () => {
    await useAuthStore.getState().login(makeUser(), makeTokens({ refreshToken: 'r-123' }));
    mockLogout.mockResolvedValueOnce(undefined);
    const clearSpy = jest.spyOn(queryClient, 'clear');

    const { result } = renderHookWithProviders(() => useLogout());
    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockLogout).toHaveBeenCalledWith({ refreshToken: 'r-123' });
    expect(clearSpy).toHaveBeenCalled();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    await expect(TokenService.isLoggedIn()).resolves.toBe(false);
    clearSpy.mockRestore();
  });

  it('still logs out locally even when the logout API call fails (offline)', async () => {
    await useAuthStore.getState().login(makeUser(), makeTokens({ refreshToken: 'r-123' }));
    mockLogout.mockRejectedValueOnce(httpError(500));

    const { result } = renderHookWithProviders(() => useLogout());
    result.current.mutate();

    // onSettled clears local state regardless of the API outcome.
    await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(false));
    await expect(TokenService.isLoggedIn()).resolves.toBe(false);
  });

  it('skips the API call when there is no refresh token', async () => {
    // Logged-in flag set but no token persisted.
    useAuthStore.setState({ isAuthenticated: true, user: makeUser() });

    const { result } = renderHookWithProviders(() => useLogout());
    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockLogout).not.toHaveBeenCalled();
  });
});
