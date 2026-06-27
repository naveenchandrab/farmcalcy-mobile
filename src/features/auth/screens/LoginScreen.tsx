import React, { useCallback, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import type { AuthScreenProps } from '@navigation/types';

import AuthButton from '../components/AuthButton';
import AuthInput from '../components/AuthInput';
import Checkbox from '../components/Checkbox';
import Logo from '../components/Logo';
import { AUTH_COLORS, AUTH_FONT, AUTH_SPACING, AUTH_TYPE } from '../components/authTokens';
import { useLogin } from '../hooks/useLogin';
import { loginSchema } from '../types';
import type { LoginFormValues } from '../types';

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
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '', rememberMe: true },
  });

  const onSubmit = useCallback(
    (values: LoginFormValues): void => {
      Keyboard.dismiss();
      login(values);
    },
    [login],
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
            <Text style={styles.heading}>Welcome Back!</Text>
            <Text style={styles.subheading}>Login to continue</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(220).duration(ENTER_DURATION)}>
            <Controller
              control={control}
              name="identifier"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthInput
                  leftIcon="account-outline"
                  placeholder="Username / Mobile Number"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorMessage={errors.identifier?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={focusPassword}
                  blurOnSubmit={false}
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
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={submit}
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
            <TouchableOpacity onPress={goToForgot} activeOpacity={0.7}>
              <Text style={styles.forgot}>Forgot Password?</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(460).duration(ENTER_DURATION)}
            style={styles.loginWrap}
          >
            <AuthButton label="Login" onPress={submit} loading={isPending} />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(540).duration(ENTER_DURATION)}
            style={styles.registerRow}
          >
            <Text style={styles.registerMuted}>Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={goToRegister} activeOpacity={0.7}>
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
