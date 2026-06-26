import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useTheme, Typography, Checkbox } from '@design-system';
import Button from '@components/Button';
import Input from '@components/Input';
import KeyboardAvoidingWrapper from '@components/KeyboardAvoidingWrapper';
import type { AuthScreenProps } from '@navigation/types';

import BrandHeader from '../components/BrandHeader';
import { useLogin } from '../hooks/useLogin';
import { loginSchema } from '../types';
import type { LoginFormValues } from '../types';

type Props = AuthScreenProps<'Login'>;

/**
 * Login screen — matches PCFMS UI reference.
 *
 * Layout:
 *   BrandHeader (logo + illustration + "Welcome Back!")
 *   Form card:
 *     ├── Email / Mobile input
 *     ├── Password input (with reveal toggle)
 *     ├── Remember me checkbox  +  Forgot password link
 *     ├── Login button
 *     └── Register link
 */
const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { mutate: login, isPending } = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = (values: LoginFormValues): void => {
    login(values);
  };

  return (
    <KeyboardAvoidingWrapper>
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <BrandHeader />

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Controller
            control={control}
            name="identifier"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Username / Mobile Number"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                errorMessage={errors.identifier?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                leftIcon="account-outline"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                errorMessage={errors.password?.message}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
                leftIcon="lock-outline"
              />
            )}
          />

          <View style={styles.row}>
            <Controller
              control={control}
              name="rememberMe"
              render={({ field: { onChange, value } }) => (
                <Checkbox
                  value={value ?? false}
                  onValueChange={onChange}
                  label="Remember me"
                />
              )}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              activeOpacity={0.7}
            >
              <Typography preset="bodyMd" style={[styles.forgotLink, { color: colors.primary }]}>
                Forgot Password?
              </Typography>
            </TouchableOpacity>
          </View>

          <Button
            variant="primary"
            fullWidth
            loading={isPending}
            onPress={handleSubmit(onSubmit)}
            style={styles.loginButton}
          >
            Login
          </Button>

          <View style={styles.registerRow}>
            <Typography preset="bodyMd" style={{ color: colors.textSecondary }}>
              Don&apos;t have an account?{' '}
            </Typography>
            <TouchableOpacity activeOpacity={0.7}>
              <Typography preset="bodyMd" style={[styles.registerLink, { color: colors.primary }]}>
                Register
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingWrapper>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    padding: 20,
    paddingBottom: 28,
    // Subtle card elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  forgotLink: {
    fontWeight: '600',
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  registerLink: {
    fontWeight: '600',
  },
});

export default LoginScreen;
