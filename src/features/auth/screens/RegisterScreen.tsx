import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type {
  TextInput} from 'react-native';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import type { AuthScreenProps } from '@navigation/types';
import { showSuccess } from '@utils/toast';

import AuthButton from '../components/AuthButton';
import AuthInput from '../components/AuthInput';
import { AUTH_COLORS, AUTH_FONT, AUTH_SPACING, AUTH_TYPE } from '../components/authTokens';
import Logo from '../components/Logo';
import { registerSchema } from '../types';
import type { RegisterFormValues } from '../types';

type Props = AuthScreenProps<'Register'>;

const ENTER_DURATION = 500;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [secure, setSecure] = useState(true);
  const [confirmSecure, setConfirmSecure] = useState(true);

  const identifierRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = useCallback(
    (_values: RegisterFormValues): void => {
      Keyboard.dismiss();
      // No registration endpoint is exposed yet — confirm the form and return
      // the user to Login. Wire to the real API once the backend ships.
      showSuccess('Account details captured. Please log in to continue.');
      navigation.goBack();
    },
    [navigation],
  );

  const submit = handleSubmit(onSubmit);
  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const toggleSecure = useCallback(() => setSecure(prev => !prev), []);
  const toggleConfirm = useCallback(() => setConfirmSecure(prev => !prev), []);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity
        onPress={goBack}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={[styles.backButton, { top: insets.top + 8 }]}
      >
        <Icon name="arrow-left" size={26} color={AUTH_COLORS.textPrimary} />
      </TouchableOpacity>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Logo />

          <Animated.View
            entering={FadeInDown.delay(120).duration(ENTER_DURATION)}
            style={styles.welcomeSection}
          >
            <Text style={styles.heading}>Create Account</Text>
            <Text style={styles.subheading}>Sign up to get started</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(220).duration(ENTER_DURATION)}>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthInput
                  leftIcon="account-outline"
                  placeholder="Full Name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorMessage={errors.fullName?.message}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => identifierRef.current?.focus()}
                  blurOnSubmit={false}
                />
              )}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(290).duration(ENTER_DURATION)}
            style={styles.fieldGap}
          >
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthInput
                  ref={identifierRef}
                  leftIcon="email-outline"
                  placeholder="Email Address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorMessage={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  blurOnSubmit={false}
                />
              )}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(360).duration(ENTER_DURATION)}
            style={styles.fieldGap}
          >
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthInput
                  ref={passwordRef}
                  leftIcon="lock-outline"
                  rightIcon={secure ? 'eye-off-outline' : 'eye-outline'}
                  onRightIconPress={toggleSecure}
                  placeholder="Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorMessage={errors.password?.message}
                  secureTextEntry={secure}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmRef.current?.focus()}
                  blurOnSubmit={false}
                />
              )}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(430).duration(ENTER_DURATION)}
            style={styles.fieldGap}
          >
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthInput
                  ref={confirmRef}
                  leftIcon="lock-check-outline"
                  rightIcon={confirmSecure ? 'eye-off-outline' : 'eye-outline'}
                  onRightIconPress={toggleConfirm}
                  placeholder="Confirm Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorMessage={errors.confirmPassword?.message}
                  secureTextEntry={confirmSecure}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={() => void submit()}
                />
              )}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(500).duration(ENTER_DURATION)}
            style={styles.submitWrap}
          >
            <AuthButton label="Register" onPress={() => void submit()} />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(580).duration(ENTER_DURATION)}
            style={styles.footerRow}
          >
            <Text style={styles.footerMuted}>Already have an account? </Text>
            <TouchableOpacity onPress={goBack} activeOpacity={0.7}>
              <Text style={styles.footerLink}>Login</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: AUTH_COLORS.background,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
    padding: 4,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: AUTH_SPACING.screenHorizontal,
  },
  welcomeSection: {
    alignItems: 'center',
    marginTop: AUTH_SPACING.logoToWelcome,
    marginBottom: AUTH_SPACING.welcomeToUsername,
  },
  heading: {
    fontSize: AUTH_TYPE.heading,
    fontFamily: AUTH_FONT.bold,
    color: AUTH_COLORS.primary,
  },
  subheading: {
    marginTop: 6,
    fontSize: AUTH_TYPE.subheading,
    fontFamily: AUTH_FONT.regular,
    color: AUTH_COLORS.textSecondary,
  },
  fieldGap: {
    marginTop: AUTH_SPACING.fieldGap,
  },
  submitWrap: {
    marginTop: AUTH_SPACING.rememberToLogin,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: AUTH_SPACING.loginToRegister,
  },
  footerMuted: {
    fontSize: AUTH_TYPE.register,
    fontFamily: AUTH_FONT.regular,
    color: AUTH_COLORS.textSecondary,
  },
  footerLink: {
    fontSize: AUTH_TYPE.register,
    fontFamily: AUTH_FONT.medium,
    color: AUTH_COLORS.primary,
  },
});

export default RegisterScreen;
