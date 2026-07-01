import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Keyboard, StyleSheet, Text, View } from 'react-native';

import AuthButton from '@features/auth/components/AuthButton';
import AuthScreenLayout from '@features/auth/components/AuthScreenLayout';
import { AUTH_COLORS, AUTH_FONT } from '@features/auth/components/authTokens';
import { registerFarmOwnerSchema } from '@features/auth/types';
import type { RegisterFarmOwnerFormValues } from '@features/auth/types';
import type { AuthScreenProps } from '@navigation/types';

import AddressFields from '../components/AddressFields';
import CompanyCodeField from '../components/CompanyCodeField';
import LocationMapPicker from '../components/LocationMapPicker';
import RegistrationTextField from '../components/RegistrationTextField';
import { useRegisterFarmOwner } from '../hooks/useRegistrationMutations';

type Props = AuthScreenProps<'RegisterFarmOwner'>;

const RegisterFarmOwnerScreen: React.FC<Props> = ({ navigation }) => {
  const { mutate: register, isPending } = useRegisterFarmOwner();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFarmOwnerFormValues>({
    resolver: zodResolver(registerFarmOwnerSchema),
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
      gpsLatitude: undefined,
      gpsLongitude: undefined,
    },
  });

  const latitude = watch('gpsLatitude');
  const longitude = watch('gpsLongitude');

  const onLocationChange = useCallback(
    (lat: number, lng: number) => {
      setValue('gpsLatitude', lat, { shouldValidate: true });
      setValue('gpsLongitude', lng, { shouldValidate: true });
    },
    [setValue],
  );

  const onSubmit = useCallback(
    (values: RegisterFarmOwnerFormValues): void => {
      if (isPending) {
        return;
      }
      Keyboard.dismiss();
      register(values, {
        onSuccess: response =>
          navigation.replace('RegistrationPending', {
            registrationId: response.id,
            requestType: 'FARM_OWNER',
            email: response.email,
          }),
      });
    },
    [isPending, register, navigation],
  );

  const submit = handleSubmit(onSubmit);

  return (
    <AuthScreenLayout
      title="Join as a Farm Owner"
      subtitle="Enter your details, your company code, your address and your farm's location."
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

      <Text style={styles.sectionLabel}>Farm location</Text>
      <View style={styles.fieldGroup}>
        <LocationMapPicker
          latitude={typeof latitude === 'number' ? latitude : undefined}
          longitude={typeof longitude === 'number' ? longitude : undefined}
          onChange={onLocationChange}
        />
        <Text style={styles.hint}>
          Optional, but it helps us locate your farm. Tap the map or drag the pin to your farm.
        </Text>
      </View>

      <View style={styles.submitWrap}>
        <AuthButton
          testID="registration-submit"
          label="Submit for Approval"
          onPress={() => void submit()}
          loading={isPending}
        />
      </View>
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
  hint: {
    fontSize: 12,
    fontFamily: AUTH_FONT.regular,
    color: AUTH_COLORS.textSecondary,
    lineHeight: 17,
  },
  submitWrap: {
    marginTop: 4,
    marginBottom: 8,
  },
});

export default RegisterFarmOwnerScreen;
