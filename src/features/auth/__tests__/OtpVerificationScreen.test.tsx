import {
  TEST_IDS,
  fireEvent,
  makeScreenProps,
  renderWithProviders,
  screen,
  waitFor,
} from '@test-utils';
import { showSuccess } from '@utils/toast';

import OtpVerificationScreen from '../screens/OtpVerificationScreen';
import { otpService } from '../services/otp.service';

jest.mock('../services/otp.service', () => ({
  otpService: { send: jest.fn(), verify: jest.fn() },
}));

// Mock the countdown so the resend cooldown is controllable without timers.
// (The countdown logic itself is unit-tested in useCountdown.test.tsx.)
const restartMock = jest.fn();
let mockCountdownState = { secondsLeft: 30, isRunning: true, restart: restartMock };
jest.mock('../hooks/useCountdown', () => ({
  useCountdown: () => mockCountdownState,
}));

const mockSend = otpService.send as jest.Mock;
const mockVerify = otpService.verify as jest.Mock;
const ID = TEST_IDS.otp;
const EMAIL = 'rajesh@abcpoultry.com';

const renderOtp = () => {
  const { navigation, props } = makeScreenProps('OtpVerification', { email: EMAIL });
  const utils = renderWithProviders(<OtpVerificationScreen {...props} />);
  return { navigation, ...utils };
};

const typeOtp = (code: string) => {
  code.split('').forEach((digit, index) => {
    fireEvent.changeText(screen.getByTestId(ID.cell(index)), digit);
  });
};

beforeEach(() => {
  restartMock.mockClear();
  mockSend.mockReset();
  mockVerify.mockReset();
  mockCountdownState = { secondsLeft: 30, isRunning: true, restart: restartMock };
});

describe('OtpVerificationScreen', () => {
  it('renders six OTP cells and masks the destination email in the subtitle', () => {
    renderOtp();
    for (let i = 0; i < 6; i += 1) {
      expect(screen.getByTestId(ID.cell(i))).toBeTruthy();
    }
    expect(screen.getByText(/ra••••@abcpoultry\.com/)).toBeTruthy();
  });

  it('keeps the Verify button disabled until all six digits are entered', () => {
    renderOtp();
    const verify = screen.getByTestId(ID.submitButton);
    expect(verify.props.accessibilityState.disabled).toBe(true);

    typeOtp('12345'); // only five digits
    expect(screen.getByTestId(ID.submitButton).props.accessibilityState.disabled).toBe(true);
  });

  it('validates the code server-side then advances to ResetPassword when it completes', async () => {
    mockVerify.mockResolvedValueOnce({ message: 'ok' });
    const { navigation } = renderOtp();
    typeOtp('123456');

    // The code is validated (without being consumed) before navigating.
    await waitFor(() =>
      expect(mockVerify).toHaveBeenCalledWith({
        email: EMAIL,
        otp: '123456',
        purpose: 'FORGOT_PASSWORD',
      }),
    );
    await waitFor(() =>
      expect(navigation.navigate).toHaveBeenCalledWith('ResetPassword', {
        email: EMAIL,
        otp: '123456',
      }),
    );
  });

  it('verifies via the button and carries the OTP forward on success', async () => {
    mockVerify.mockResolvedValueOnce({ message: 'ok' });
    const { navigation } = renderOtp();
    typeOtp('654321');
    fireEvent.press(screen.getByTestId(ID.submitButton));

    await waitFor(() =>
      expect(navigation.navigate).toHaveBeenCalledWith('ResetPassword', {
        email: EMAIL,
        otp: '654321',
      }),
    );
  });

  it('shows an inline error and does NOT advance when the code is invalid', async () => {
    // Backend rejects a wrong code with 401.
    mockVerify.mockRejectedValueOnce({ response: { status: 401 } });
    const { navigation } = renderOtp();
    typeOtp('000000');

    await waitFor(() =>
      expect(screen.getByText(/code you entered is incorrect/i)).toBeTruthy(),
    );
    // Crucially, the user is kept on the OTP screen.
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  describe('resend cooldown', () => {
    it('shows the countdown timer and hides the resend button while running', () => {
      renderOtp();
      expect(screen.getByTestId(ID.resendTimer)).toBeTruthy();
      expect(screen.queryByTestId(ID.resendButton)).toBeNull();
    });

    it('shows the resend button once the cooldown elapses', () => {
      mockCountdownState = { secondsLeft: 0, isRunning: false, restart: restartMock };
      renderOtp();
      expect(screen.getByTestId(ID.resendButton)).toBeTruthy();
      expect(screen.queryByTestId(ID.resendTimer)).toBeNull();
    });

    it('resends the OTP, restarts the cooldown and confirms with a toast', async () => {
      mockCountdownState = { secondsLeft: 0, isRunning: false, restart: restartMock };
      mockSend.mockResolvedValueOnce({ message: 'ok' });
      renderOtp();

      fireEvent.press(screen.getByTestId(ID.resendButton));

      await waitFor(() =>
        expect(mockSend).toHaveBeenCalledWith({ email: EMAIL, purpose: 'FORGOT_PASSWORD' }),
      );
      expect(restartMock).toHaveBeenCalled();
      expect(showSuccess).toHaveBeenCalledWith(
        expect.stringMatching(/new code has been sent/i),
      );
    });
  });

  it('goes back when the back button is pressed', () => {
    const { navigation } = renderOtp();
    fireEvent.press(screen.getByTestId(ID.backButton));
    expect(navigation.goBack).toHaveBeenCalled();
  });
});
