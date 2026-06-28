import React, { useCallback, useState } from 'react';
import { Keyboard, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { OTP_LENGTH, OTP_RESEND_COOLDOWN_SECONDS } from '@constants';
import { TEST_IDS } from '@constants/testIDs';
import type { AuthScreenProps } from '@navigation/types';
import { showSuccess } from '@utils/toast';

import AuthButton from '../components/AuthButton';
import AuthOtpInput from '../components/AuthOtpInput';
import AuthScreenLayout from '../components/AuthScreenLayout';
import { AUTH_COLORS, AUTH_FONT, AUTH_SPACING, AUTH_TYPE } from '../components/authTokens';
import { useCountdown } from '../hooks/useCountdown';
import { useResendOtp } from '../hooks/useResendOtp';
import { useVerifyOtp } from '../hooks/useVerifyOtp';
import { otpSchema } from '../types';
import { maskEmail } from '../utils/format';

type Props = AuthScreenProps<'OtpVerification'>;

const OtpVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | undefined>();

  const { secondsLeft, isRunning, restart } = useCountdown(OTP_RESEND_COOLDOWN_SECONDS);
  const { mutate: resend, isPending: isResending } = useResendOtp();
  const { mutate: verifyOtp, isPending: isVerifying, getErrorMessage } = useVerifyOtp();

  const handleChange = useCallback((value: string) => {
    setOtp(value);
    setError(undefined);
  }, []);

  const proceed = useCallback(
    (code: string): void => {
      const result = otpSchema.safeParse({ otp: code });
      if (!result.success) {
        setError(result.error.issues[0]?.message ?? `Enter the ${OTP_LENGTH}-digit code`);
        return;
      }
      Keyboard.dismiss();
      // Validate the code with the server BEFORE advancing. `/otp/verify` does
      // not consume it (that happens at reset time), so a correct code stays
      // usable. An incorrect code keeps the user on this screen with an inline
      // error instead of letting them fill in a new password first.
      verifyOtp(
        { email, otp: result.data.otp },
        {
          onSuccess: () =>
            navigation.navigate('ResetPassword', { email, otp: result.data.otp }),
          onError: (err: unknown) => setError(getErrorMessage(err)),
        },
      );
    },
    [email, navigation, verifyOtp, getErrorMessage],
  );

  const onVerifyPress = useCallback(() => proceed(otp), [otp, proceed]);

  const onResend = useCallback((): void => {
    if (isRunning || isResending) {
      return;
    }
    resend(email, {
      onSuccess: () => {
        setOtp('');
        setError(undefined);
        restart();
        showSuccess('A new code has been sent if the email is registered.');
      },
    });
  }, [email, isRunning, isResending, resend, restart]);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <AuthScreenLayout
      testID={TEST_IDS.otp.screen}
      backTestID={TEST_IDS.otp.backButton}
      title="Verify OTP"
      subtitle={`Enter the ${OTP_LENGTH}-digit code we sent to ${maskEmail(email)}.`}
      onBack={goBack}
    >
      <Animated.View entering={FadeInDown.delay(120).duration(450)} style={styles.otpWrap}>
        <AuthOtpInput
          testID={TEST_IDS.otp.input}
          value={otp}
          onChange={handleChange}
          onComplete={proceed}
          errorMessage={error}
          editable={!isResending && !isVerifying}
        />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(200).duration(450)}
        style={styles.resendRow}
      >
        <Text style={styles.resendMuted}>Didn&apos;t receive the code? </Text>
        {isRunning ? (
          <Text testID={TEST_IDS.otp.resendTimer} style={styles.resendTimer}>
            Resend in {secondsLeft}s
          </Text>
        ) : (
          <TouchableOpacity
            testID={TEST_IDS.otp.resendButton}
            onPress={onResend}
            activeOpacity={0.7}
            disabled={isResending}
            accessibilityRole="button"
            accessibilityLabel="Resend OTP"
          >
            <Text style={styles.resendLink}>{isResending ? 'Sending…' : 'Resend OTP'}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(280).duration(450)}
        style={styles.buttonWrap}
      >
        <AuthButton
          testID={TEST_IDS.otp.submitButton}
          label="Verify"
          onPress={onVerifyPress}
          loading={isVerifying}
          disabled={otp.length !== OTP_LENGTH || isVerifying}
        />
      </Animated.View>

      <View style={styles.spacer} />
    </AuthScreenLayout>
  );
};

const styles = StyleSheet.create({
  otpWrap: {
    marginTop: 8,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: AUTH_SPACING.passwordToRemember,
  },
  resendMuted: {
    fontSize: AUTH_TYPE.register,
    fontFamily: AUTH_FONT.regular,
    color: AUTH_COLORS.textSecondary,
  },
  resendTimer: {
    fontSize: AUTH_TYPE.register,
    fontFamily: AUTH_FONT.medium,
    color: AUTH_COLORS.textSecondary,
  },
  resendLink: {
    fontSize: AUTH_TYPE.register,
    fontFamily: AUTH_FONT.semibold,
    color: AUTH_COLORS.primary,
  },
  buttonWrap: {
    marginTop: AUTH_SPACING.rememberToLogin,
  },
  spacer: {
    flex: 1,
  },
});

export default OtpVerificationScreen;
