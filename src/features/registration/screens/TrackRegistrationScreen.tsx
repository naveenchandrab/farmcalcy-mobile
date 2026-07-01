import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Keyboard, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { z } from 'zod';

import AuthButton from '@features/auth/components/AuthButton';
import AuthInput from '@features/auth/components/AuthInput';
import AuthScreenLayout from '@features/auth/components/AuthScreenLayout';
import { AUTH_COLORS, AUTH_FONT } from '@features/auth/components/authTokens';
import { looksLikePhone } from '@features/auth/types';
import type { AuthScreenProps } from '@navigation/types';
import { getErrorStatus } from '@services/ApiErrorMapper';

import { useTrackRegistration } from '../hooks/useRegistrationMutations';
import type { RegistrationStatusResponse } from '../types';

type Props = AuthScreenProps<'TrackRegistration'>;

const trackSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Email or mobile number is required')
    .refine(
      value => z.string().email().safeParse(value).success || looksLikePhone(value),
      'Enter a valid email address or mobile number',
    ),
});

type TrackFormValues = z.infer<typeof trackSchema>;

const STATUS_META: Record<
  RegistrationStatusResponse['status'],
  { icon: string; color: string; title: string; message: string }
> = {
  PENDING: {
    icon: 'clock-outline',
    color: AUTH_COLORS.orange,
    title: 'Pending Review',
    message: 'Your registration is awaiting approval. We will notify you by email and SMS.',
  },
  APPROVED: {
    icon: 'check-circle-outline',
    color: AUTH_COLORS.primary,
    title: 'Approved',
    message:
      'Your account has been approved. Please check your email and SMS for login credentials.',
  },
  REJECTED: {
    icon: 'close-circle-outline',
    color: AUTH_COLORS.error,
    title: 'Not Approved',
    message: 'Unfortunately your registration was not approved.',
  },
};

const TrackRegistrationScreen: React.FC<Props> = ({ navigation }) => {
  const { mutate: track, isPending } = useTrackRegistration();
  const [result, setResult] = useState<RegistrationStatusResponse | null>(null);
  const [notFound, setNotFound] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TrackFormValues>({
    resolver: zodResolver(trackSchema),
    mode: 'onBlur',
    defaultValues: { identifier: '' },
  });

  const onSubmit = useCallback(
    (values: TrackFormValues): void => {
      if (isPending) {
        return;
      }
      Keyboard.dismiss();
      setResult(null);
      setNotFound(false);
      track(values.identifier, {
        onSuccess: status => setResult(status),
        onError: error => setNotFound(getErrorStatus(error) === 404),
      });
    },
    [isPending, track],
  );

  const submit = handleSubmit(onSubmit);
  const meta = result ? STATUS_META[result.status] : null;

  return (
    <AuthScreenLayout
      title="Track Registration"
      subtitle="Enter the email or mobile number you registered with to check your status."
      onBack={() => navigation.goBack()}
    >
      <Controller
        control={control}
        name="identifier"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthInput
            testID="track-identifier"
            leftIcon="account-search-outline"
            placeholder="Email or Mobile Number"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            errorMessage={errors.identifier?.message}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
        )}
      />

      <View style={styles.submitWrap}>
        <AuthButton
          testID="track-submit"
          label="Check Status"
          onPress={() => void submit()}
          loading={isPending}
        />
      </View>

      {notFound && (
        <View style={styles.resultCard}>
          <Icon name="information-outline" size={28} color={AUTH_COLORS.textSecondary} />
          <Text style={styles.resultTitle}>No registration found</Text>
          <Text style={styles.resultMessage}>
            We couldn&apos;t find a registration for those details. Check the email or mobile number
            and try again.
          </Text>
        </View>
      )}

      {result && meta && (
        <View style={styles.resultCard}>
          <View style={[styles.resultIcon, { backgroundColor: `${meta.color}1A` }]}>
            <Icon name={meta.icon} size={32} color={meta.color} />
          </View>
          <Text style={[styles.resultTitle, { color: meta.color }]}>{meta.title}</Text>
          <Text style={styles.resultMessage}>{meta.message}</Text>
          {result.status === 'REJECTED' && result.rejectionReason ? (
            <Text style={styles.reason}>Reason: {result.rejectionReason}</Text>
          ) : null}
        </View>
      )}
    </AuthScreenLayout>
  );
};

const styles = StyleSheet.create({
  submitWrap: {
    marginTop: 24,
  },
  resultCard: {
    marginTop: 28,
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    borderRadius: 14,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  resultIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontFamily: AUTH_FONT.bold,
    color: AUTH_COLORS.textPrimary,
    textAlign: 'center',
  },
  resultMessage: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: AUTH_FONT.regular,
    color: AUTH_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  reason: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: AUTH_FONT.medium,
    color: AUTH_COLORS.error,
    textAlign: 'center',
  },
});

export default TrackRegistrationScreen;
