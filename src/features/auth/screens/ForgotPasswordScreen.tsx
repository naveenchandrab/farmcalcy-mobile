import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Keyboard, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { TEST_IDS } from '@constants/testIDs';
import type { AuthScreenProps } from '@navigation/types';

import AuthButton from '../components/AuthButton';
import AuthInput from '../components/AuthInput';
import AuthScreenLayout from '../components/AuthScreenLayout';
import { AUTH_SPACING } from '../components/authTokens';
import { useForgotPassword } from '../hooks/useForgotPassword';
import { forgotPasswordSchema } from '../types';
import type { ForgotPasswordFormValues } from '../types';

type Props = AuthScreenProps<'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { mutate: requestOtp, isPending } = useForgotPassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
    defaultValues: { email: '' },
  });

  const onSubmit = useCallback(
    (values: ForgotPasswordFormValues): void => {
      if (isPending) {
        return;
      }
      Keyboard.dismiss();
      const email = values.email.trim();

      requestOtp(email, {
        onSuccess: () => {
          // The backend always returns 200 (enumeration safe); proceed to OTP
          // entry regardless. The OTP screen explains that a code was sent only
          // if the email is registered.
          navigation.navigate('OtpVerification', { email });
        },
      });
    },
    [isPending, navigation, requestOtp],
  );

  const submit = handleSubmit(onSubmit);
  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <AuthScreenLayout
      testID={TEST_IDS.forgotPassword.screen}
      backTestID={TEST_IDS.forgotPassword.backButton}
      title="Forgot Password?"
      subtitle="Enter the email linked to your account and we'll send you a one-time code to reset your password."
      onBack={goBack}
    >
      <Animated.View entering={FadeInDown.delay(120).duration(450)}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthInput
              testID={TEST_IDS.forgotPassword.emailInput}
              leftIcon="email-outline"
              placeholder="Email Address"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              errorMessage={errors.email?.message}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="send"
              onSubmitEditing={() => void submit()}
              editable={!isPending}
              accessibilityLabel="Email address"
            />
          )}
        />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(200).duration(450)}
        style={styles.buttonWrap}
      >
        <AuthButton
          testID={TEST_IDS.forgotPassword.submitButton}
          label="Send OTP"
          onPress={() => void submit()}
          loading={isPending}
        />
      </Animated.View>

      <View style={styles.spacer} />
    </AuthScreenLayout>
  );
};

const styles = StyleSheet.create({
  buttonWrap: {
    marginTop: AUTH_SPACING.rememberToLogin,
  },
  spacer: {
    flex: 1,
  },
});

export default ForgotPasswordScreen;
