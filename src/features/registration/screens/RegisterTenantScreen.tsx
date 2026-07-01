import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Keyboard, StyleSheet, Text, View } from 'react-native';

import AuthButton from '@features/auth/components/AuthButton';
import AuthScreenLayout from '@features/auth/components/AuthScreenLayout';
import { AUTH_COLORS, AUTH_FONT } from '@features/auth/components/authTokens';
import { registerTenantSchema } from '@features/auth/types';
import type { RegisterTenantFormValues } from '@features/auth/types';
import type { AuthScreenProps } from '@navigation/types';

import AadhaarUpload from '../components/AadhaarUpload';
import AddressFields from '../components/AddressFields';
import RegistrationTextField from '../components/RegistrationTextField';
import { useRegisterTenant } from '../hooks/useRegistrationMutations';

type Props = AuthScreenProps<'RegisterTenant'>;

const RegisterTenantScreen: React.FC<Props> = ({ navigation }) => {
  const { mutate: register, isPending } = useRegisterTenant();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterTenantFormValues>({
    resolver: zodResolver(registerTenantSchema),
    mode: 'onBlur',
    defaultValues: {
      companyName: '',
      companyEmail: '',
      companyPhone: '',
      addressLine1: '',
      addressLine2: '',
      taluk: '',
      village: '',
      landmark: '',
      district: '',
      state: '',
      pincode: '',
      gstNumber: '',
      firstName: '',
      lastName: '',
      adminEmail: '',
      phoneNumber: '',
      aadhaarFrontUrl: undefined,
      aadhaarBackUrl: undefined,
    },
  });

  const onSubmit = useCallback(
    (values: RegisterTenantFormValues): void => {
      if (isPending) {
        return;
      }
      Keyboard.dismiss();
      register(values, {
        onSuccess: response =>
          navigation.replace('RegistrationPending', {
            registrationId: response.id,
            requestType: 'TENANT',
            email: response.email,
          }),
      });
    },
    [isPending, register, navigation],
  );

  const submit = handleSubmit(onSubmit);

  return (
    <AuthScreenLayout
      title="Register a Company"
      subtitle="Tell us about your business. No password needed — we'll generate one once your company is approved."
      onBack={() => navigation.goBack()}
    >
      <Text style={styles.sectionLabel}>Company details</Text>
      <View style={styles.fieldGroup}>
        <RegistrationTextField
          control={control}
          name="companyName"
          leftIcon="office-building-outline"
          placeholder="Company Name"
          autoCapitalize="words"
          error={errors.companyName?.message}
        />
        <RegistrationTextField
          control={control}
          name="companyEmail"
          leftIcon="email-outline"
          placeholder="Company Email"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.companyEmail?.message}
        />
        <RegistrationTextField
          control={control}
          name="companyPhone"
          leftIcon="phone-outline"
          placeholder="Company Phone"
          keyboardType="phone-pad"
          autoCapitalize="none"
          error={errors.companyPhone?.message}
        />
        <RegistrationTextField
          control={control}
          name="gstNumber"
          leftIcon="file-document-outline"
          placeholder="GST Number (optional)"
          autoCapitalize="characters"
          error={errors.gstNumber?.message}
        />
      </View>

      <Text style={styles.sectionLabel}>Company address</Text>
      <View style={styles.fieldGroup}>
        <AddressFields control={control} errors={errors} />
      </View>

      <Text style={styles.sectionLabel}>Owner / Founder (as per Aadhaar)</Text>
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
          name="adminEmail"
          leftIcon="email-outline"
          placeholder="Owner Email"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.adminEmail?.message}
        />
        <RegistrationTextField
          control={control}
          name="phoneNumber"
          leftIcon="phone-outline"
          placeholder="Owner Phone Number"
          keyboardType="phone-pad"
          autoCapitalize="none"
          error={errors.phoneNumber?.message}
        />
      </View>

      <Text style={styles.sectionLabel}>Owner Aadhaar photos (optional)</Text>
      <View style={styles.fieldGroup}>
        <AadhaarUpload control={control} frontName="aadhaarFrontUrl" backName="aadhaarBackUrl" />
        <Text style={styles.hint}>
          Upload clear photos of the front and back of the owner&apos;s Aadhaar card.
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

export default RegisterTenantScreen;
