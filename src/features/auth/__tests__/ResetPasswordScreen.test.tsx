import {
  TEST_IDS,
  fireEvent,
  httpError,
  makeScreenProps,
  renderWithProviders,
  screen,
  waitFor,
} from '@test-utils';
import { showError } from '@utils/toast';

import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import { authService } from '../services/auth.service';

jest.mock('../services/auth.service', () => ({
  authService: { resetPassword: jest.fn() },
}));

const mockReset = authService.resetPassword as jest.Mock;
const ID = TEST_IDS.resetPassword;
const PARAMS = { email: 'rajesh@abcpoultry.com', otp: '123456' };

const renderReset = () => {
  const { navigation, props } = makeScreenProps('ResetPassword', PARAMS);
  const utils = renderWithProviders(<ResetPasswordScreen {...props} />);
  return { navigation, ...utils };
};

const fillPasswords = (newPw: string, confirmPw: string) => {
  fireEvent.changeText(screen.getByTestId(ID.newPasswordInput), newPw);
  fireEvent.changeText(screen.getByTestId(ID.confirmPasswordInput), confirmPw);
};

describe('ResetPasswordScreen', () => {
  it('renders both password fields', () => {
    renderReset();
    expect(screen.getByTestId(ID.newPasswordInput)).toBeTruthy();
    expect(screen.getByTestId(ID.confirmPasswordInput)).toBeTruthy();
  });

  it('keeps the submit button disabled until the form is valid', async () => {
    renderReset();
    expect(screen.getByTestId(ID.submitButton).props.accessibilityState.disabled).toBe(true);

    fillPasswords('NewPass123', 'NewPass123');
    await waitFor(() =>
      expect(screen.getByTestId(ID.submitButton).props.accessibilityState.disabled).toBe(
        false,
      ),
    );
  });

  it('shows a mismatch error and never submits', async () => {
    renderReset();
    fillPasswords('NewPass123', 'Different123');

    expect(await screen.findByText('Passwords do not match')).toBeTruthy();
    expect(screen.getByTestId(ID.submitButton).props.accessibilityState.disabled).toBe(true);
  });

  it('shows the policy error for a weak password', async () => {
    renderReset();
    fillPasswords('weakpass', 'weakpass');
    expect(
      await screen.findByText('Password must include uppercase, lowercase and a number'),
    ).toBeTruthy();
  });

  it('toggles password visibility', () => {
    renderReset();
    expect(screen.getByTestId(ID.newPasswordInput).props.secureTextEntry).toBe(true);
    fireEvent.press(screen.getByTestId(ID.newPasswordToggle));
    expect(screen.getByTestId(ID.newPasswordInput).props.secureTextEntry).toBe(false);
  });

  it('resets the password and shows the success terminal state', async () => {
    mockReset.mockResolvedValueOnce({ message: 'Password updated.' });
    const { navigation } = renderReset();

    fillPasswords('NewPass123', 'NewPass123');
    await waitFor(() =>
      expect(screen.getByTestId(ID.submitButton).props.accessibilityState.disabled).toBe(
        false,
      ),
    );
    fireEvent.press(screen.getByTestId(ID.submitButton));

    expect(await screen.findByTestId(ID.successView)).toBeTruthy();
    expect(mockReset).toHaveBeenCalledWith({
      ...PARAMS,
      newPassword: 'NewPass123',
      confirmPassword: 'NewPass123',
    });

    // The CTA clears the stack back to Login.
    fireEvent.press(screen.getByTestId(ID.successCta));
    expect(navigation.reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  });

  it('routes back to OTP entry when the code is invalid/expired (401)', async () => {
    mockReset.mockRejectedValueOnce(httpError(401));
    const { navigation } = renderReset();

    fillPasswords('NewPass123', 'NewPass123');
    await waitFor(() =>
      expect(screen.getByTestId(ID.submitButton).props.accessibilityState.disabled).toBe(
        false,
      ),
    );
    fireEvent.press(screen.getByTestId(ID.submitButton));

    await waitFor(() =>
      expect(navigation.navigate).toHaveBeenCalledWith('OtpVerification', {
        email: PARAMS.email,
      }),
    );
    expect(showError).toHaveBeenCalledWith(
      expect.stringMatching(/invalid or has expired/i),
    );
  });

  it('shows a rate-limit toast without navigating on 429', async () => {
    mockReset.mockRejectedValueOnce(httpError(429));
    const { navigation } = renderReset();

    fillPasswords('NewPass123', 'NewPass123');
    await waitFor(() =>
      expect(screen.getByTestId(ID.submitButton).props.accessibilityState.disabled).toBe(
        false,
      ),
    );
    fireEvent.press(screen.getByTestId(ID.submitButton));

    await waitFor(() =>
      expect(showError).toHaveBeenCalledWith(expect.stringMatching(/too many attempts/i)),
    );
    expect(navigation.navigate).not.toHaveBeenCalled();
  });
});
