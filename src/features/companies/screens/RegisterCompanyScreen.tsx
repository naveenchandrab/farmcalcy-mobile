import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { registerTenantSchema } from '@features/auth/types/index';
import type { RegisterTenantFormValues } from '@features/auth/types/index';
import AadhaarUpload from '@features/registration/components/AadhaarUpload';
import AddressFields from '@features/registration/components/AddressFields';
import RegistrationTextField from '@features/registration/components/RegistrationTextField';
import { useRegisterTenant } from '@features/registration/hooks/useRegistrationMutations';
import ScreenHeader from '@navigation/ScreenHeader';
import type { SaasAdminStackParamList } from '@navigation/types';
import { showSuccess } from '@utils/toast';

const GREEN = '#1E8038';
const MUTED = '#7A7A7A';

type Nav = NativeStackNavigationProp<SaasAdminStackParamList>;

const RegisterCompanyScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
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
        onSuccess: () => {
          showSuccess('Company registration submitted. Awaiting approval from another SaaS admin.');
          navigation.navigate('RegistrationsTab' as never);
        },
      });
    },
    [isPending, register, navigation],
  );

  const submit = handleSubmit(onSubmit);

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Register Company" variant="back" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>
            Fill in the company details below. The registration will be reviewed and approved by
            another SaaS admin before the company and its admin account are created.
          </Text>

          <Text style={styles.sectionLabel}>Company Details</Text>
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

          <Text style={styles.sectionLabel}>Company Address</Text>
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

          <Text style={styles.sectionLabel}>Owner Aadhaar Photos (Optional)</Text>
          <View style={styles.fieldGroup}>
            <AadhaarUpload
              control={control}
              frontName="aadhaarFrontUrl"
              backName="aadhaarBackUrl"
            />
            <Text style={styles.hint}>
              Upload clear photos of the front and back of the owner&apos;s Aadhaar card.
            </Text>
          </View>

          <View style={styles.submitRow}>
            <View style={[styles.submitBtn, isPending && styles.submitBtnDisabled]}>
              <Text style={styles.submitBtnText} onPress={() => void submit()} suppressHighlighting>
                {isPending ? 'Submitting…' : 'Submit for Approval'}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F7F9F7' },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  subtitle: {
    fontSize: 13,
    color: MUTED,
    lineHeight: 19,
    marginBottom: 24,
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: GREEN,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },

  fieldGroup: {
    gap: 16,
    marginBottom: 24,
  },

  hint: {
    fontSize: 12,
    color: MUTED,
    lineHeight: 17,
  },

  submitRow: {
    marginTop: 8,
    marginBottom: 8,
  },

  submitBtn: {
    backgroundColor: GREEN,
    borderRadius: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  submitBtnDisabled: {
    opacity: 0.6,
  },

  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default RegisterCompanyScreen;
