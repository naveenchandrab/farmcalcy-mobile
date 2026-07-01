import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Keyboard, StyleSheet, Text, View } from 'react-native';

import AuthButton from '@features/auth/components/AuthButton';
import AuthScreenLayout from '@features/auth/components/AuthScreenLayout';
import { AUTH_COLORS, AUTH_FONT } from '@features/auth/components/authTokens';
import { registerStaffSchema } from '@features/auth/types';
import type { RegisterStaffFormValues } from '@features/auth/types';
import type { AuthScreenProps } from '@navigation/types';

import AddressFields from '../components/AddressFields';
import CompanyCodeField from '../components/CompanyCodeField';
import RegistrationTextField from '../components/RegistrationTextField';
import { useRegisterSupervisor } from '../hooks/useRegistrationMutations';

type Props = AuthScreenProps<'RegisterSupervisor'>;

const RegisterSupervisorScreen: React.FC<Props> = ({ navigation }) => {
  const { mutate: register, isPending } = useRegisterSupervisor();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterStaffFormValues>({
    resolver: zodResolver(registerStaffSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      companyCode: '',
      addressLine1: '',
      addressLine2: '',
      taluk: '',
      village: '',
      landmark: '',
      district: '',
      state: '',
      pincode: '',
    },
  });

  const onSubmit = useCallback(
    (values: RegisterStaffFormValues): void => {
      if (isPending) {
        return;
      }
      Keyboard.dismiss();
      register(values, {
        onSuccess: response =>
          navigation.replace('RegistrationPending', {
            registrationId: response.id,
            requestType: 'SUPERVISOR',
            email: response.email,
          }),
      });
    },
    [isPending, register, navigation],
  );

  const submit = handleSubmit(onSubmit);

  return (
    <AuthScreenLayout
      title="Join as a Supervisor"
      subtitle="Enter your details and your company code. Your company admin will approve your request."
      onBack={() => navigation.goBack()}
    >
      <Text style={styles.sectionLabel}>Your details</Text>
      <View style={styles.fieldGroup}>
        <RegistrationTextField
          control={control}
          name="firstName"
          leftIcon="account-outline"
          placeholder="First Name"
          autoCapitalize="words"
          error={errors.firstName?.message}
        />
        <RegistrationTextField
          control={control}
          name="lastName"
          leftIcon="account-outline"
          placeholder="Last Name"
          autoCapitalize="words"
          error={errors.lastName?.message}
        />
        <RegistrationTextField
          control={control}
          name="phoneNumber"
          leftIcon="phone-outline"
          placeholder="Mobile Number"
          keyboardType="phone-pad"
          autoCapitalize="none"
          error={errors.phoneNumber?.message}
        />
        <RegistrationTextField
          control={control}
          name="email"
          leftIcon="email-outline"
          placeholder="Email (optional)"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email?.message}
        />
        <CompanyCodeField
          control={control}
          name="companyCode"
          error={errors.companyCode?.message}
        />
      </View>

      <Text style={styles.sectionLabel}>Your address</Text>
      <View style={styles.fieldGroup}>
        <AddressFields control={control} errors={errors} />
      </View>

      <AuthButton
        testID="registration-submit"
        label="Submit for Approval"
        onPress={() => void submit()}
        loading={isPending}
      />
    </AuthScreenLayout>
  );
};

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 14,
    fontFamily: AUTH_FONT.semibold,
    color: AUTH_COLORS.primary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldGroup: {
    gap: 16,
    marginBottom: 24,
  },
});

export default RegisterSupervisorScreen;
