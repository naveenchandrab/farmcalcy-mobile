import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { TextInput} from 'react-native';
import { Keyboard, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { TEST_IDS } from '@constants/testIDs';
import type { AuthScreenProps } from '@navigation/types';
import { getErrorStatus } from '@services/ApiErrorMapper';
import { showError } from '@utils/toast';

import AuthButton from '../components/AuthButton';
import AuthInput from '../components/AuthInput';
import AuthScreenLayout from '../components/AuthScreenLayout';
import AuthSuccessView from '../components/AuthSuccessView';
import { AUTH_SPACING } from '../components/authTokens';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { useResetPassword } from '../hooks/useResetPassword';
import { resetPasswordSchema } from '../types';
import type { ResetPasswordFormValues } from '../types';

type Props = AuthScreenProps<'ResetPassword'>;

const ResetPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  const { email, otp } = route.params;
  const { mutate: resetPassword, isPending } = useResetPassword();

  const [succeeded, setSucceeded] = useState(false);
  const [secure, setSecure] = useState(true);
  const [confirmSecure, setConfirmSecure] = useState(true);
  const confirmRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const newPassword = watch('newPassword');

  const goToLogin = useCallback(() => {
    // Clear the entire auth stack so the user cannot navigate back into the
    // reset flow after completing it.
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  }, [navigation]);

  const onSubmit = useCallback(
    (values: ResetPasswordFormValues): void => {
      if (isPending) {
        return;
      }
      Keyboard.dismiss();

      resetPassword(
        {
          email,
          otp,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        },
        {
          onSuccess: () => setSucceeded(true),
          onError: (error: unknown) => {
            const status = getErrorStatus(error);
            // The OTP is verified at this step; a 400/401 means the code is
            // invalid, expired or exhausted — send the user back to request a
            // fresh one rather than stranding them on this screen.
            if (status === 400 || status === 401) {
              showError('This code is invalid or has expired. Please request a new one.');
              navigation.navigate('OtpVerification', { email });
              return;
            }
            if (status === 429) {
              showError('Too many attempts. Please wait a moment and try again.');
              return;
            }
            showError('We could not reset your password. Please try again.');
          },
        },
      );
    },
    [email, otp, isPending, navigation, resetPassword],
  );

  const submit = handleSubmit(onSubmit);
  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const toggleSecure = useCallback(() => setSecure(prev => !prev), []);
  const toggleConfirm = useCallback(() => setConfirmSecure(prev => !prev), []);
  const focusConfirm = useCallback(() => confirmRef.current?.focus(), []);

  if (succeeded) {
    return (
      <AuthSuccessView
        testID={TEST_IDS.resetPassword.successView}
        ctaTestID={TEST_IDS.resetPassword.successCta}
        title="Password Reset"
        message="Your password has been changed successfully. Please log in with your new password."
        ctaLabel="Back to Login"
        onCtaPress={goToLogin}
      />
    );
  }

  return (
    <AuthScreenLayout
      testID={TEST_IDS.resetPassword.screen}
      backTestID={TEST_IDS.resetPassword.backButton}
      title="Reset Password"
      subtitle="Create a new password. Make it strong and don't reuse an old one."
      onBack={goBack}
    >
      <Animated.View entering={FadeInDown.delay(120).duration(450)}>
        <Controller
          control={control}
          name="newPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthInput
              testID={TEST_IDS.resetPassword.newPasswordInput}
              leftIcon="lock-outline"
              rightIcon={secure ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={toggleSecure}
              rightIconTestID={TEST_IDS.resetPassword.newPasswordToggle}
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
              onSubmitEditing={focusConfirm}
              blurOnSubmit={false}
              editable={!isPending}
              accessibilityLabel="New password"
            />
          )}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(180).duration(450)}>
        <PasswordStrengthMeter password={newPassword} />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(240).duration(450)}
        style={styles.fieldGap}
      >
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthInput
              ref={confirmRef}
              testID={TEST_IDS.resetPassword.confirmPasswordInput}
              leftIcon="lock-check-outline"
              rightIcon={confirmSecure ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={toggleConfirm}
              rightIconTestID={TEST_IDS.resetPassword.confirmPasswordToggle}
              placeholder="Confirm Password"
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
              accessibilityLabel="Confirm password"
            />
          )}
        />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(300).duration(450)}
        style={styles.buttonWrap}
      >
        <AuthButton
          testID={TEST_IDS.resetPassword.submitButton}
          label="Reset Password"
          onPress={() => void submit()}
          loading={isPending}
          disabled={!isValid}
        />
      </Animated.View>

      <View style={styles.spacer} />
    </AuthScreenLayout>
  );
};

const styles = StyleSheet.create({
  fieldGap: {
    marginTop: AUTH_SPACING.fieldGap,
  },
  buttonWrap: {
    marginTop: AUTH_SPACING.rememberToLogin,
  },
  spacer: {
    flex: 1,
  },
});

export default ResetPasswordScreen;
