import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import Button from '@components/Button';
import Input from '@components/Input';
import KeyboardAvoidingWrapper from '@components/KeyboardAvoidingWrapper';
import Loader from '@components/Loader';
import { useTheme, Typography } from '@design-system';
import type { SaasAdminScreenProps } from '@navigation/types';

import RoleSelector from '../components/RoleSelector';
import { useUpdateUser, useUser } from '../hooks/useUsers';
import { editUserSchema } from '../types';
import type { EditUserFormValues } from '../types';

type Props = SaasAdminScreenProps<'EditUser'>;

/**
 * Edit User Screen — pre-populates the form from cached user data.
 * Password field is optional; leave blank to keep existing password.
 */
const EditUserScreen: React.FC<Props> = ({ navigation, route }) => {
  const { userId } = route.params;
  const { colors } = useTheme();

  const { data: user, isLoading } = useUser(userId);
  const { mutate: updateUser, isPending } = useUpdateUser(userId);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    values: user
      ? {
          name: user.name,
          email: user.email,
          phone: user.phone ?? '',
          role: user.role,
          password: '',
        }
      : undefined,
  });

  if (isLoading) {
    return <Loader message="Loading user…" />;
  }

  const onSubmit = (values: EditUserFormValues): void => {
    updateUser(values, {
      onSuccess: () => navigation.goBack(),
    });
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Typography preset="headingSm" style={styles.headerTitle}>Edit User</Typography>
        <View style={styles.headerBtn} />
      </View>

      <KeyboardAvoidingWrapper contentStyle={styles.content}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Full Name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              errorMessage={errors.name?.message}
              autoCapitalize="words"
              returnKeyType="next"
              leftIcon="account-outline"
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email Address"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              errorMessage={errors.email?.message}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              leftIcon="email-outline"
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Mobile Number (Optional)"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              errorMessage={errors.phone?.message}
              keyboardType="phone-pad"
              returnKeyType="next"
              leftIcon="phone-outline"
            />
          )}
        />

        <Controller
          control={control}
          name="role"
          render={({ field: { onChange, value } }) => (
            <RoleSelector
              value={value}
              onChange={onChange}
              errorMessage={errors.role?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="New Password (leave blank to keep current)"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              errorMessage={errors.password?.message}
              secureTextEntry
              returnKeyType="done"
              leftIcon="lock-outline"
            />
          )}
        />

        <Button
          variant="primary"
          fullWidth
          loading={isPending}
          onPress={handleSubmit(onSubmit)}
          style={styles.submitButton}
        >
          Save Changes
        </Button>
      </KeyboardAvoidingWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 8,
  },
  headerBtn: { width: 40, padding: 8 },
  headerTitle: { flex: 1, color: '#fff', textAlign: 'center' },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  submitButton: { marginTop: 8 },
});

export default EditUserScreen;
