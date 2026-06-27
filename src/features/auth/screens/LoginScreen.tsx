import { zodResolver } from '@hookform/resolvers/zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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

import { STORAGE_KEY_REMEMBERED_EMAIL } from '@constants';
import type { AuthScreenProps } from '@navigation/types';

import AuthButton from '../components/AuthButton';
import AuthInput from '../components/AuthInput';
import { AUTH_COLORS, AUTH_FONT, AUTH_SPACING, AUTH_TYPE } from '../components/authTokens';
import Checkbox from '../components/Checkbox';
import Logo from '../components/Logo';
import { useLogin } from '../hooks/useLogin';
import { loginSchema } from '../types';
import type { LoginApiResponse, LoginFormValues } from '../types';

type Props = AuthScreenProps<'Login'>;

const ENTER_DURATION = 500;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { mutate: login, isPending } = useLogin();
  const [secure, setSecure] = useState(true);
  const passwordRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '', rememberMe: true },
  });

  // Restore the remembered email (never the password) on mount.
  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(STORAGE_KEY_REMEMBERED_EMAIL).then(saved => {
      if (active && saved) {
        setValue('email', saved);
      }
    });
    return () => {
      active = false;
    };
  }, [setValue]);

  const persistRememberedEmail = useCallback(
    (values: LoginFormValues): void => {
      if (values.rememberMe) {
        void AsyncStorage.setItem(STORAGE_KEY_REMEMBERED_EMAIL, values.email.trim());
      } else {
        void AsyncStorage.removeItem(STORAGE_KEY_REMEMBERED_EMAIL);
      }
    },
    [],
  );

  const onSubmit = useCallback(
    (values: LoginFormValues): void => {
      if (isPending) {
        return; // guard against duplicate submissions
      }
      Keyboard.dismiss();

      login(values, {
        onSuccess: (response: LoginApiResponse) => {
          persistRememberedEmail(values);
          // A normal login swaps stacks automatically via the auth store.
          // A forced first-login change must route to its dedicated screen.
          if (response.user.mustChangePassword) {
            navigation.navigate('ForceChangePassword', { email: response.user.email });
          }
        },
      });
    },
    [isPending, login, navigation, persistRememberedEmail],
  );

  const submit = handleSubmit(onSubmit);
  const toggleSecure = useCallback(() => setSecure(prev => !prev), []);
  const focusPassword = useCallback(() => passwordRef.current?.focus(), []);
  const goToForgot = useCallback(() => navigation.navigate('ForgotPassword'), [navigation]);
  const goToRegister = useCallback(() => navigation.navigate('Register'), [navigation]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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
            <Text style={styles.heading} accessibilityRole="header">
              Welcome Back!
            </Text>
            <Text style={styles.subheading}>Login to continue</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(220).duration(ENTER_DURATION)}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthInput
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
                  returnKeyType="next"
                  onSubmitEditing={focusPassword}
                  blurOnSubmit={false}
                  editable={!isPending}
                  accessibilityLabel="Email address"
                />
              )}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(300).duration(ENTER_DURATION)}
            style={styles.passwordWrap}
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
                  textContentType="password"
                  autoComplete="password"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={() => void submit()}
                  editable={!isPending}
                  accessibilityLabel="Password"
                />
              )}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(380).duration(ENTER_DURATION)}
            style={styles.optionsRow}
          >
            <Controller
              control={control}
              name="rememberMe"
              render={({ field: { onChange, value } }) => (
                <Checkbox value={value ?? false} onValueChange={onChange} label="Remember me" />
              )}
            />
            <TouchableOpacity
              onPress={goToForgot}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Forgot password"
            >
              <Text style={styles.forgot}>Forgot Password?</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(460).duration(ENTER_DURATION)}
            style={styles.loginWrap}
          >
            <AuthButton label="Login" onPress={() => void submit()} loading={isPending} />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(540).duration(ENTER_DURATION)}
            style={styles.registerRow}
          >
            <Text style={styles.registerMuted}>Don&apos;t have an account? </Text>
            <TouchableOpacity
              onPress={goToRegister}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Register"
            >
              <Text style={styles.registerLink}>Register</Text>
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
  content: {
    flexGrow: 1,
    paddingHorizontal: AUTH_SPACING.screenHorizontal,
  },
  welcomeSection: {
    alignItems: 'center',
    marginTop: AUTH_SPACING.logoToWelcome,
    marginBottom: AUTH_SPACING.logoToWelcome,
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
  passwordWrap: {
    marginTop: AUTH_SPACING.fieldGap,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: AUTH_SPACING.passwordToRemember,
  },
  forgot: {
    fontSize: AUTH_TYPE.register,
    fontFamily: AUTH_FONT.semibold,
    color: AUTH_COLORS.primary,
  },
  loginWrap: {
    marginTop: AUTH_SPACING.rememberToLogin,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: AUTH_SPACING.loginToRegister,
  },
  registerMuted: {
    fontSize: AUTH_TYPE.register,
    fontFamily: AUTH_FONT.regular,
    color: AUTH_COLORS.textSecondary,
  },
  registerLink: {
    fontSize: AUTH_TYPE.register,
    fontFamily: AUTH_FONT.medium,
    color: AUTH_COLORS.primary,
  },
});

export default LoginScreen;
