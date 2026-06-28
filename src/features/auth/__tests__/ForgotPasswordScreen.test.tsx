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

import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import { authService } from '../services/auth.service';

jest.mock('../services/auth.service', () => ({
  authService: { forgotPassword: jest.fn() },
}));

const mockForgot = authService.forgotPassword as jest.Mock;
const ID = TEST_IDS.forgotPassword;

const renderForgot = () => {
  const { navigation, props } = makeScreenProps('ForgotPassword', undefined);
  const utils = renderWithProviders(<ForgotPasswordScreen {...props} />);
  return { navigation, ...utils };
};

describe('ForgotPasswordScreen', () => {
  it('renders the email field and submit button', () => {
    renderForgot();
    expect(screen.getByTestId(ID.emailInput)).toBeTruthy();
    expect(screen.getByTestId(ID.submitButton)).toBeTruthy();
  });

  it('blocks submission of an empty email', async () => {
    renderForgot();
    fireEvent.press(screen.getByTestId(ID.submitButton));
    expect(await screen.findByText('Email is required')).toBeTruthy();
    expect(mockForgot).not.toHaveBeenCalled();
  });

  it('blocks submission of an invalid email', async () => {
    renderForgot();
    fireEvent.changeText(screen.getByTestId(ID.emailInput), 'bad-email');
    fireEvent.press(screen.getByTestId(ID.submitButton));
    expect(await screen.findByText('Enter a valid email address')).toBeTruthy();
    expect(mockForgot).not.toHaveBeenCalled();
  });

  it('requests an OTP and navigates to the verification screen on success', async () => {
    mockForgot.mockResolvedValueOnce({ message: 'ok' });
    const { navigation } = renderForgot();

    fireEvent.changeText(screen.getByTestId(ID.emailInput), 'rajesh@abcpoultry.com');
    fireEvent.press(screen.getByTestId(ID.submitButton));

    await waitFor(() =>
      expect(navigation.navigate).toHaveBeenCalledWith('OtpVerification', {
        email: 'rajesh@abcpoultry.com',
      }),
    );
    expect(mockForgot).toHaveBeenCalledWith({ email: 'rajesh@abcpoultry.com' });
  });

  it('does NOT navigate and surfaces a toast when the request fails', async () => {
    mockForgot.mockRejectedValueOnce(httpError(429));
    const { navigation } = renderForgot();

    fireEvent.changeText(screen.getByTestId(ID.emailInput), 'rajesh@abcpoultry.com');
    fireEvent.press(screen.getByTestId(ID.submitButton));

    await waitFor(() => expect(showError).toHaveBeenCalled());
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it('goes back when the back button is pressed', () => {
    const { navigation } = renderForgot();
    fireEvent.press(screen.getByTestId(ID.backButton));
    expect(navigation.goBack).toHaveBeenCalled();
  });
});
