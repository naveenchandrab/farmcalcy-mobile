import { TokenService } from '@services/TokenService';
import { useAuthStore } from '@store/authStore';
import {
  TEST_IDS,
  fireEvent,
  httpError,
  makeTokens,
  makeUser,
  makeScreenProps,
  renderWithProviders,
  screen,
  waitFor,
} from '@test-utils';
import { showError, showSuccess } from '@utils/toast';

import ForceChangePasswordScreen from '../screens/ForceChangePasswordScreen';
import { authService } from '../services/auth.service';
import { otpService } from '../services/otp.service';

jest.mock('../services/auth.service', () => ({
  authService: { changePassword: jest.fn() },
}));
jest.mock('../services/otp.service', () => ({
  otpService: { send: jest.fn() },
}));

const restartMock = jest.fn();
let mockCountdownState = { secondsLeft: 30, isRunning: true, restart: restartMock };
jest.mock('../hooks/useCountdown', () => ({
  useCountdown: () => mockCountdownState,
}));

const mockChange = authService.changePassword as jest.Mock;
const mockSend = otpService.send as jest.Mock;
const ID = TEST_IDS.forceChange;
const EMAIL = 'rajesh@abcpoultry.com';

const renderScreen = () => {
  const { navigation, props } = makeScreenProps('ForceChangePassword', { email: EMAIL });
  const utils = renderWithProviders(<ForceChangePasswordScreen {...props} />);
  return { navigation, ...utils };
};

/** Fills a fully valid change-password form so the submit button enables. */
const fillValidForm = () => {
  fireEvent.changeText(screen.getByTestId(ID.currentPasswordInput), 'OldPass123');
  '123456'.split('').forEach((digit, index) => {
    fireEvent.changeText(screen.getByTestId(`${ID.otpInput}-${index}`), digit);
  });
  fireEvent.changeText(screen.getByTestId(ID.newPasswordInput), 'NewPass123');
  fireEvent.changeText(screen.getByTestId(ID.confirmPasswordInput), 'NewPass123');
};

beforeEach(async () => {
  restartMock.mockClear();
  mockCountdownState = { secondsLeft: 30, isRunning: true, restart: restartMock };
  mockSend.mockResolvedValue({ message: 'ok' });
  await TokenService.clearTokens();
  // Arrange the "mid forced-change" session the screen operates within.
  await useAuthStore
    .getState()
    .beginForcedPasswordChange(makeUser({ email: EMAIL, mustChangePassword: true }), makeTokens());
});

describe('ForceChangePasswordScreen', () => {
  it('dispatches a PASSWORD_CHANGE OTP automatically on mount', async () => {
    renderScreen();
    await waitFor(() =>
      expect(mockSend).toHaveBeenCalledWith({ email: EMAIL, purpose: 'PASSWORD_CHANGE' }),
    );
  });

  it('renders every field plus the "different account" escape hatch', () => {
    renderScreen();
    expect(screen.getByTestId(ID.currentPasswordInput)).toBeTruthy();
    expect(screen.getByTestId(`${ID.otpInput}-0`)).toBeTruthy();
    expect(screen.getByTestId(ID.newPasswordInput)).toBeTruthy();
    expect(screen.getByTestId(ID.confirmPasswordInput)).toBeTruthy();
    expect(screen.getByTestId(ID.differentAccountLink)).toBeTruthy();
  });

  it('keeps submit disabled until the whole form is valid', async () => {
    renderScreen();
    expect(screen.getByTestId(ID.submitButton).props.accessibilityState.disabled).toBe(true);

    fillValidForm();
    await waitFor(() =>
      expect(screen.getByTestId(ID.submitButton).props.accessibilityState.disabled).toBe(
        false,
      ),
    );
  });

  it('submits the change and grants access on success', async () => {
    mockChange.mockResolvedValueOnce(makeTokens({ accessToken: 'fresh', refreshToken: 'fresh-r' }));
    renderScreen();
    fillValidForm();

    await waitFor(() =>
      expect(screen.getByTestId(ID.submitButton).props.accessibilityState.disabled).toBe(
        false,
      ),
    );
    fireEvent.press(screen.getByTestId(ID.submitButton));

    await waitFor(() =>
      expect(mockChange).toHaveBeenCalledWith({
        currentPassword: 'OldPass123',
        newPassword: 'NewPass123',
        confirmPassword: 'NewPass123',
        otp: '123456',
      }),
    );
    await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(true));
    expect(useAuthStore.getState().mustChangePassword).toBe(false);
  });

  it('shows a clear error when the current password or OTP is wrong (401)', async () => {
    mockChange.mockRejectedValueOnce(httpError(401));
    renderScreen();
    fillValidForm();

    await waitFor(() =>
      expect(screen.getByTestId(ID.submitButton).props.accessibilityState.disabled).toBe(
        false,
      ),
    );
    fireEvent.press(screen.getByTestId(ID.submitButton));

    await waitFor(() =>
      expect(showError).toHaveBeenCalledWith(
        expect.stringMatching(/current password or OTP is incorrect/i),
      ),
    );
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('logs out and returns to Login via "different account"', async () => {
    const { navigation } = renderScreen();
    fireEvent.press(screen.getByTestId(ID.differentAccountLink));

    await waitFor(() =>
      expect(navigation.reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'Login' }] }),
    );
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  describe('resend OTP', () => {
    it('resends the code and restarts the cooldown when the timer has elapsed', async () => {
      mockCountdownState = { secondsLeft: 0, isRunning: false, restart: restartMock };
      renderScreen();
      await waitFor(() => expect(mockSend).toHaveBeenCalledTimes(1)); // mount send

      fireEvent.press(screen.getByTestId(ID.resendButton));

      await waitFor(() => expect(mockSend).toHaveBeenCalledTimes(2));
      expect(restartMock).toHaveBeenCalled();
      expect(showSuccess).toHaveBeenCalledWith(expect.stringMatching(/new code has been sent/i));
    });
  });
});
