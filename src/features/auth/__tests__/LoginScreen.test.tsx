import AsyncStorage from '@react-native-async-storage/async-storage';

import { TokenService } from '@services/TokenService';
import { useAuthStore } from '@store/authStore';
import {
  TEST_IDS,
  fireEvent,
  httpError,
  makeLoginResponse,
  makeScreenProps,
  renderWithProviders,
  screen,
  waitFor,
} from '@test-utils';

import LoginScreen from '../screens/LoginScreen';
import { authService } from '../services/auth.service';

jest.mock('../services/auth.service', () => ({
  authService: { login: jest.fn() },
}));

const mockLogin = authService.login as jest.Mock;
const ID = TEST_IDS.login;

const renderLogin = () => {
  const { navigation, props } = makeScreenProps('Login', undefined);
  const utils = renderWithProviders(<LoginScreen {...props} />);
  return { navigation, ...utils };
};

beforeEach(async () => {
  await AsyncStorage.clear();
  await TokenService.clearTokens();
  useAuthStore.setState({
    user: null,
    isInitializing: false,
    isAuthenticated: false,
    mustChangePassword: false,
  });
});

describe('LoginScreen', () => {
  describe('rendering', () => {
    it('renders the form with all interactive elements', () => {
      renderLogin();
      expect(screen.getByTestId(ID.screen)).toBeTruthy();
      expect(screen.getByTestId(ID.emailInput)).toBeTruthy();
      expect(screen.getByTestId(ID.passwordInput)).toBeTruthy();
      expect(screen.getByTestId(ID.submitButton)).toBeTruthy();
      expect(screen.getByText('Welcome Back!')).toBeTruthy();
    });
  });

  describe('validation', () => {
    it('shows "required" errors when submitting an empty form', async () => {
      renderLogin();
      fireEvent.press(screen.getByTestId(ID.submitButton));

      expect(await screen.findByText('Email or mobile number is required')).toBeTruthy();
      expect(screen.getByText('Password is required')).toBeTruthy();
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('rejects an identifier that is neither email nor phone', async () => {
      renderLogin();
      fireEvent.changeText(screen.getByTestId(ID.emailInput), 'not-an-email');
      fireEvent.changeText(screen.getByTestId(ID.passwordInput), 'Password123');
      fireEvent.press(screen.getByTestId(ID.submitButton));

      expect(await screen.findByText('Enter a valid email address or mobile number')).toBeTruthy();
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('rejects a too-short password', async () => {
      renderLogin();
      fireEvent.changeText(screen.getByTestId(ID.emailInput), 'rajesh@abcpoultry.com');
      fireEvent.changeText(screen.getByTestId(ID.passwordInput), 'short');
      fireEvent.press(screen.getByTestId(ID.submitButton));

      expect(await screen.findByText('Password must be at least 8 characters')).toBeTruthy();
    });
  });

  describe('password visibility toggle', () => {
    it('reveals and re-hides the password', () => {
      renderLogin();
      const password = screen.getByTestId(ID.passwordInput);
      expect(password.props.secureTextEntry).toBe(true);

      fireEvent.press(screen.getByTestId(ID.passwordToggle));
      expect(screen.getByTestId(ID.passwordInput).props.secureTextEntry).toBe(false);

      fireEvent.press(screen.getByTestId(ID.passwordToggle));
      expect(screen.getByTestId(ID.passwordInput).props.secureTextEntry).toBe(true);
    });
  });

  describe('submission', () => {
    it('calls the login service with the entered credentials', async () => {
      mockLogin.mockResolvedValueOnce(makeLoginResponse());
      renderLogin();

      fireEvent.changeText(screen.getByTestId(ID.emailInput), 'rajesh@abcpoultry.com');
      fireEvent.changeText(screen.getByTestId(ID.passwordInput), 'Password123');
      fireEvent.press(screen.getByTestId(ID.submitButton));

      await waitFor(() =>
        expect(mockLogin).toHaveBeenCalledWith({
          identifier: 'rajesh@abcpoultry.com',
          password: 'Password123',
        }),
      );
    });

    it('persists the remembered email on a successful login', async () => {
      mockLogin.mockResolvedValueOnce(makeLoginResponse());
      renderLogin();

      fireEvent.changeText(screen.getByTestId(ID.emailInput), 'rajesh@abcpoultry.com');
      fireEvent.changeText(screen.getByTestId(ID.passwordInput), 'Password123');
      fireEvent.press(screen.getByTestId(ID.submitButton));

      await waitFor(async () =>
        expect(await AsyncStorage.getItem('farmseasy:remembered-email')).toBe(
          'rajesh@abcpoultry.com',
        ),
      );
    });

    it('navigates to ForceChangePassword when the user must change their password', async () => {
      const response = makeLoginResponse();
      response.user.mustChangePassword = true;
      mockLogin.mockResolvedValueOnce(response);
      const { navigation } = renderLogin();

      fireEvent.changeText(screen.getByTestId(ID.emailInput), 'rajesh@abcpoultry.com');
      fireEvent.changeText(screen.getByTestId(ID.passwordInput), 'Password123');
      fireEvent.press(screen.getByTestId(ID.submitButton));

      await waitFor(() =>
        expect(navigation.navigate).toHaveBeenCalledWith('ForceChangePassword', {
          email: response.user.email,
        }),
      );
    });

    it('does NOT navigate for a normal login (the store swaps the stack)', async () => {
      mockLogin.mockResolvedValueOnce(makeLoginResponse());
      const { navigation } = renderLogin();

      fireEvent.changeText(screen.getByTestId(ID.emailInput), 'rajesh@abcpoultry.com');
      fireEvent.changeText(screen.getByTestId(ID.passwordInput), 'Password123');
      fireEvent.press(screen.getByTestId(ID.submitButton));

      await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(true));
      expect(navigation.navigate).not.toHaveBeenCalledWith(
        'ForceChangePassword',
        expect.anything(),
      );
    });

    it('clears the remembered email when "Remember me" is unchecked', async () => {
      await AsyncStorage.setItem('farmseasy:remembered-email', 'old@abcpoultry.com');
      mockLogin.mockResolvedValueOnce(makeLoginResponse());
      renderLogin();

      fireEvent.changeText(screen.getByTestId(ID.emailInput), 'rajesh@abcpoultry.com');
      fireEvent.changeText(screen.getByTestId(ID.passwordInput), 'Password123');
      fireEvent.press(screen.getByTestId(ID.rememberMe)); // uncheck (defaults to true)
      fireEvent.press(screen.getByTestId(ID.submitButton));

      await waitFor(async () =>
        expect(await AsyncStorage.getItem('farmseasy:remembered-email')).toBeNull(),
      );
    });

    it('ignores further taps once a login is in flight (no duplicate submit)', async () => {
      // A never-resolving login keeps isPending true so the button stays in its
      // loading/disabled state and the guard is exercised.
      mockLogin.mockReturnValue(new Promise(() => {}));
      renderLogin();

      fireEvent.changeText(screen.getByTestId(ID.emailInput), 'rajesh@abcpoultry.com');
      fireEvent.changeText(screen.getByTestId(ID.passwordInput), 'Password123');
      fireEvent.press(screen.getByTestId(ID.submitButton));

      // Wait for the button to flip into its loading (disabled) state…
      await waitFor(() =>
        expect(screen.getByTestId(ID.submitButton).props.accessibilityState.disabled).toBe(true),
      );
      // …then additional taps must be no-ops.
      fireEvent.press(screen.getByTestId(ID.submitButton));
      fireEvent.press(screen.getByTestId(ID.submitButton));
      expect(mockLogin).toHaveBeenCalledTimes(1);
    });

    it('keeps the user logged out on invalid credentials', async () => {
      mockLogin.mockRejectedValueOnce(httpError(401));
      renderLogin();

      fireEvent.changeText(screen.getByTestId(ID.emailInput), 'rajesh@abcpoultry.com');
      fireEvent.changeText(screen.getByTestId(ID.passwordInput), 'WrongPass123');
      fireEvent.press(screen.getByTestId(ID.submitButton));

      await waitFor(() => expect(mockLogin).toHaveBeenCalled());
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('navigation links', () => {
    it('navigates to ForgotPassword', () => {
      const { navigation } = renderLogin();
      fireEvent.press(screen.getByTestId(ID.forgotPasswordLink));
      expect(navigation.navigate).toHaveBeenCalledWith('ForgotPassword');
    });

    it('navigates to Register', () => {
      const { navigation } = renderLogin();
      fireEvent.press(screen.getByTestId(ID.registerLink));
      expect(navigation.navigate).toHaveBeenCalledWith('Register');
    });
  });

  describe('remembered email', () => {
    it('restores a previously remembered email on mount', async () => {
      await AsyncStorage.setItem('farmseasy:remembered-email', 'saved@abcpoultry.com');
      renderLogin();

      await waitFor(() =>
        expect(screen.getByTestId(ID.emailInput).props.value).toBe('saved@abcpoultry.com'),
      );
    });
  });
});
