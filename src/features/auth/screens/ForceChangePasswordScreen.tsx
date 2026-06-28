import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type {
  TextInput} from 'react-native';
import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { OTP_RESEND_COOLDOWN_SECONDS } from '@constants';
import { TEST_IDS } from '@constants/testIDs';
import type { AuthScreenProps } from '@navigation/types';
import { getErrorStatus } from '@services/ApiErrorMapper';
import { useAuthStore } from '@store/authStore';
import { showError, showSuccess } from '@utils/toast';

import AuthButton from '../components/AuthButton';
import AuthInput from '../components/AuthInput';
import AuthOtpInput from '../components/AuthOtpInput';
import AuthScreenLayout from '../components/AuthScreenLayout';
import { AUTH_COLORS, AUTH_FONT, AUTH_SPACING, AUTH_TYPE } from '../components/authTokens';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { useChangePassword } from '../hooks/useChangePassword';
import { useCountdown } from '../hooks/useCountdown';
import { useResendOtp } from '../hooks/useResendOtp';
import { OtpPurpose, changePasswordSchema } from '../types';
import type { ChangePasswordFormValues } from '../types';
import { maskEmail } from '../utils/format';

type Props = AuthScreenProps<'ForceChangePassword'>;

const ForceChangePasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  const { email } = route.params;

  const logout = useAuthStore(state => state.logout);
  const { mutate: changePassword, isPending } = useChangePassword();
  const { mutate: sendOtp, isPending: isSending } = useResendOtp(OtpPurpose.PasswordChange);
  const { secondsLeft, isRunning, restart } = useCountdown(OTP_RESEND_COOLDOWN_SECONDS);

  const newPasswordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const [secure, setSecure] = useState(true);
  const [confirmSecure, setConfirmSecure] = useState(true);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: { currentPassword: '', otp: '', newPassword: '', confirmPassword: '' },
  });

  const newPassword = watch('newPassword');

  // Dispatch the PASSWORD_CHANGE OTP automatically when the screen opens.
  useEffect(() => {
    sendOtp(email);
    // Send exactly once on mount; resend is user-driven afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onResend = useCallback((): void => {
    if (isRunning || isSending) {
      return;
    }
    sendOtp(email, {
      onSuccess: () => {
        restart();
        showSuccess('A new code has been sent to your email.');
      },
    });
  }, [email, isRunning, isSending, restart, sendOtp]);

  const onSubmit = useCallback(
    (values: ChangePasswordFormValues): void => {
      if (isPending) {
        return;
      }
      Keyboard.dismiss();

      changePassword(
        {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
          otp: values.otp,
        },
        {
          // On success the auth store grants access and the navigator swaps to
          // the app stack — no manual navigation needed here.
          onError: (error: unknown) => {
            const status = getErrorStatus(error);
            if (status === 401) {
              showError('Your current password or OTP is incorrect. Please try again.');
              return;
            }
            if (status === 429) {
              showError('Too many attempts. Please wait a moment and try again.');
              return;
            }
            showError('We could not update your password. Please check your details and try again.');
          },
        },
      );
    },
    [changePassword, isPending],
  );

  const submit = handleSubmit(onSubmit);
  const toggleSecure = useCallback(() => setSecure(prev => !prev), []);
  const toggleConfirm = useCallback(() => setConfirmSecure(prev => !prev), []);

  const onUseDifferentAccount = useCallback(async (): Promise<void> => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  }, [logout, navigation]);

  return (
    <AuthScreenLayout
      testID={TEST_IDS.forceChange.screen}
      title="Set a New Password"
      subtitle={`For your security you must change your password before continuing. We've sent a verification code to ${maskEmail(
        email,
      )}.`}
    >
      <Animated.View entering={FadeInDown.delay(120).duration(450)}>
        <Controller
          control={control}
          name="currentPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthInput
              testID={TEST_IDS.forceChange.currentPasswordInput}
              leftIcon="lock-outline"
              rightIcon={secure ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={toggleSecure}
              rightIconTestID={TEST_IDS.forceChange.currentPasswordToggle}
              placeholder="Current Password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              errorMessage={errors.currentPassword?.message}
              secureTextEntry={secure}
              textContentType="password"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              blurOnSubmit={false}
              editable={!isPending}
              accessibilityLabel="Current password"
            />
          )}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(180).duration(450)} style={styles.fieldGap}>
        <Text style={styles.label}>Verification Code</Text>
        <Controller
          control={control}
          name="otp"
          render={({ field: { onChange, value } }) => (
            <AuthOtpInput
              testID={TEST_IDS.forceChange.otpInput}
              value={value}
              onChange={onChange}
              errorMessage={errors.otp?.message}
              editable={!isPending}
              autoFocus={false}
            />
          )}
        />
        <View style={styles.resendRow}>
          {isRunning ? (
            <Text testID={TEST_IDS.forceChange.resendTimer} style={styles.resendTimer}>
              Resend code in {secondsLeft}s
            </Text>
          ) : (
            <TouchableOpacity
              testID={TEST_IDS.forceChange.resendButton}
              onPress={onResend}
              activeOpacity={0.7}
              disabled={isSending}
              accessibilityRole="button"
              accessibilityLabel="Resend verification code"
            >
              <Text style={styles.resendLink}>
                {isSending ? 'Sending…' : 'Resend code'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(240).duration(450)} style={styles.fieldGap}>
        <Controller
          control={control}
          name="newPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthInput
              ref={newPasswordRef}
              testID={TEST_IDS.forceChange.newPasswordInput}
              leftIcon="lock-plus-outline"
              placeholder="New Password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              errorMessage={errors.newPassword?.message}
              secureTextEntry={secure}
              textContentType="newPassword"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
              blurOnSubmit={false}
              editable={!isPending}
              accessibilityLabel="New password"
            />
          )}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(280).duration(450)}>
        <PasswordStrengthMeter password={newPassword} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(320).duration(450)} style={styles.fieldGap}>
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthInput
              ref={confirmRef}
              testID={TEST_IDS.forceChange.confirmPasswordInput}
              leftIcon="lock-check-outline"
              rightIcon={confirmSecure ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={toggleConfirm}
              rightIconTestID={TEST_IDS.forceChange.confirmPasswordToggle}
              placeholder="Confirm New Password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              errorMessage={errors.confirmPassword?.message}
              secureTextEntry={confirmSecure}
              textContentType="newPassword"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={() => void submit()}
              editable={!isPending}
              accessibilityLabel="Confirm new password"
            />
          )}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(360).duration(450)} style={styles.buttonWrap}>
        <AuthButton
          testID={TEST_IDS.forceChange.submitButton}
          label="Update Password"
          onPress={() => void submit()}
          loading={isPending}
          disabled={!isValid}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(420).duration(450)} style={styles.footerRow}>
        <TouchableOpacity
          testID={TEST_IDS.forceChange.differentAccountLink}
          onPress={() => void onUseDifferentAccount()}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Sign in with a different account"
        >
          <Text style={styles.footerLink}>Sign in with a different account</Text>
        </TouchableOpacity>
      </Animated.View>
    </AuthScreenLayout>
  );
};

const styles = StyleSheet.create({
  fieldGap: {
    marginTop: AUTH_SPACING.fieldGap,
  },
  label: {
    marginBottom: 10,
    fontSize: AUTH_TYPE.label,
    fontFamily: AUTH_FONT.medium,
    color: AUTH_COLORS.textPrimary,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
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
  footerRow: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerLink: {
    fontSize: AUTH_TYPE.register,
    fontFamily: AUTH_FONT.medium,
    color: AUTH_COLORS.textSecondary,
    textDecorationLine: 'underline',
  },
});

export default ForceChangePasswordScreen;
