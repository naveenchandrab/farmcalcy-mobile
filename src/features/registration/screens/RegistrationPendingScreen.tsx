import { useQuery } from '@tanstack/react-query';
import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import AuthButton from '@features/auth/components/AuthButton';
import {
  AUTH_COLORS,
  AUTH_FONT,
  AUTH_SPACING,
  AUTH_TYPE,
} from '@features/auth/components/authTokens';
import type { AuthScreenProps } from '@navigation/types';

import { registrationService } from '../services/registration.service';
import type { RegistrationStatus, RegistrationStatusResponse } from '../types';

type Props = AuthScreenProps<'RegistrationPending'>;

const STATUS_META: Record<
  RegistrationStatus,
  { icon: string; color: string; title: string; message: string }
> = {
  PENDING: {
    icon: 'clock-outline',
    color: AUTH_COLORS.orange,
    title: 'Registration Submitted',
    message:
      'Your request is pending review. We will notify you by email and SMS once it has been approved.',
  },
  APPROVED: {
    icon: 'check-bold',
    color: AUTH_COLORS.primary,
    title: 'Registration Approved',
    message:
      'Your account is ready! Check your email or SMS for your temporary password, then log in.',
  },
  REJECTED: {
    icon: 'close-thick',
    color: AUTH_COLORS.error,
    title: 'Registration Not Approved',
    message: 'Unfortunately your request was not approved. Please contact support for assistance.',
  },
};

const RegistrationPendingScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { registrationId } = route.params;

  // Poll the public status endpoint so the screen reflects approval/rejection
  // if the applicant keeps it open. Falls back to PENDING until it resolves.
  const statusQuery = useQuery<RegistrationStatusResponse, Error>({
    queryKey: ['registration-status', registrationId] as const,
    queryFn: () => registrationService.getStatus(registrationId),
    refetchOnWindowFocus: false,
  });
  const { refetch, isFetching } = statusQuery;
  const data = statusQuery.data as RegistrationStatusResponse | undefined;

  const status: RegistrationStatus = data?.status ?? 'PENDING';
  const meta = STATUS_META[status];
  const reason: string | null = data?.rejectionReason ?? null;

  const goToLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  return (
    <View
      style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
    >
      <View style={styles.center}>
        <Animated.View
          entering={ZoomIn.duration(350)}
          style={[styles.iconCircle, { backgroundColor: meta.color }]}
        >
          <Icon name={meta.icon} size={48} color={AUTH_COLORS.white} />
        </Animated.View>

        <Animated.Text entering={FadeIn.delay(150).duration(350)} style={styles.title}>
          {meta.title}
        </Animated.Text>

        <Animated.Text entering={FadeIn.delay(250).duration(350)} style={styles.message}>
          {meta.message}
        </Animated.Text>

        {status === 'REJECTED' && reason ? (
          <Text style={styles.reason}>Reason: {reason}</Text>
        ) : null}

        <View style={styles.referenceBox}>
          <Text style={styles.referenceLabel}>Reference ID</Text>
          <Text style={styles.referenceValue} selectable>
            {registrationId}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        {status === 'PENDING' ? (
          <Text
            testID="registration-refresh"
            onPress={() => void refetch()}
            style={styles.refreshLink}
          >
            {isFetching ? 'Checking…' : 'Check status'}
          </Text>
        ) : null}
        <AuthButton label="Back to Login" onPress={goToLogin} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AUTH_COLORS.background,
    paddingHorizontal: AUTH_SPACING.screenHorizontal,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  title: {
    marginTop: 28,
    fontSize: AUTH_TYPE.heading,
    fontFamily: AUTH_FONT.bold,
    color: AUTH_COLORS.primary,
    textAlign: 'center',
  },
  message: {
    marginTop: 12,
    fontSize: AUTH_TYPE.subheading,
    fontFamily: AUTH_FONT.regular,
    color: AUTH_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  reason: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: AUTH_FONT.medium,
    color: AUTH_COLORS.error,
    textAlign: 'center',
  },
  referenceBox: {
    marginTop: 28,
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  referenceLabel: {
    fontSize: 12,
    fontFamily: AUTH_FONT.semibold,
    color: AUTH_COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  referenceValue: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: AUTH_FONT.medium,
    color: AUTH_COLORS.textPrimary,
  },
  actions: {
    gap: 16,
  },
  refreshLink: {
    textAlign: 'center',
    fontSize: AUTH_TYPE.register,
    fontFamily: AUTH_FONT.semibold,
    color: AUTH_COLORS.primary,
  },
});

export default RegistrationPendingScreen;
