import { waitFor } from '@testing-library/react-native';

import { TokenService } from '@services/TokenService';
import { useAuthStore } from '@store/authStore';
import {
  httpError,
  makeLoginResponse,
  networkError,
  renderHookWithProviders,
  validCredentials,
} from '@test-utils';
import { showError } from '@utils/toast';

import { useLogin } from '../hooks/useLogin';
import { authService } from '../services/auth.service';

jest.mock('../services/auth.service', () => ({
  authService: { login: jest.fn() },
}));

const mockLogin = authService.login as jest.Mock;

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

describe('useLogin', () => {
  it('authenticates a normal user and grants access via the store', async () => {
    mockLogin.mockResolvedValueOnce(makeLoginResponse());

    const { result } = renderHookWithProviders(() => useLogin());
    result.current.mutate({ ...validCredentials, rememberMe: true });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().mustChangePassword).toBe(false);
  });

  it('trims the identifier before sending it to the API', async () => {
    mockLogin.mockResolvedValueOnce(makeLoginResponse());

    const { result } = renderHookWithProviders(() => useLogin());
    result.current.mutate({
      identifier: '  rajesh@abcpoultry.com  ',
      password: 'Password123',
    } as any);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockLogin).toHaveBeenCalledWith({
      identifier: 'rajesh@abcpoultry.com',
      password: 'Password123',
    });
  });

  it('routes a mustChangePassword user into the forced-change state (no access)', async () => {
    const response = makeLoginResponse();
    response.user.mustChangePassword = true;
    mockLogin.mockResolvedValueOnce(response);

    const { result } = renderHookWithProviders(() => useLogin());
    result.current.mutate(validCredentials as any);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.mustChangePassword).toBe(true);
  });

  it('shows a friendly, non-revealing toast on invalid credentials (401)', async () => {
    mockLogin.mockRejectedValueOnce(httpError(401));

    const { result } = renderHookWithProviders(() => useLogin());
    result.current.mutate(validCredentials as any);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(showError).toHaveBeenCalledWith('The credentials you entered are incorrect.');
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('shows the connectivity toast on a network error', async () => {
    mockLogin.mockRejectedValueOnce(networkError());

    const { result } = renderHookWithProviders(() => useLogin());
    result.current.mutate(validCredentials as any);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(showError).toHaveBeenCalledWith(expect.stringMatching(/internet connection/i));
  });
});
