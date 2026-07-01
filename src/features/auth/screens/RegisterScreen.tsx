import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import type { AuthScreenProps } from '@navigation/types';

import { AUTH_COLORS, AUTH_FONT, AUTH_SPACING, AUTH_TYPE } from '../components/authTokens';
import Logo from '../components/Logo';

type Props = AuthScreenProps<'Register'>;

const ENTER_DURATION = 450;

interface Option {
  key: string;
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  const options: Option[] = [
    {
      key: 'tenant',
      icon: 'office-building-outline',
      title: 'Register a Company',
      subtitle: 'Onboard your poultry business as a new tenant',
      onPress: () => navigation.navigate('RegisterTenant'),
    },
    {
      key: 'supervisor',
      icon: 'account-tie-outline',
      title: 'Join as a Supervisor',
      subtitle: 'Use your company code to request access',
      onPress: () => navigation.navigate('RegisterSupervisor'),
    },
    {
      key: 'farm-owner',
      icon: 'home-group',
      title: 'Join as a Farm Owner',
      subtitle: 'Register your farm with its location',
      onPress: () => navigation.navigate('RegisterFarmOwner'),
    },
  ];

  return (
    <View style={styles.flex}>
      <TouchableOpacity
        onPress={goBack}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={[styles.backButton, { top: insets.top + 8 }]}
      >
        <Icon name="arrow-left" size={26} color={AUTH_COLORS.textPrimary} />
      </TouchableOpacity>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 56, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Logo />

        <Animated.View
          entering={FadeInDown.delay(120).duration(ENTER_DURATION)}
          style={styles.heroSection}
        >
          <Text style={styles.heading} accessibilityRole="header">
            Create Account
          </Text>
          <Text style={styles.subheading}>How would you like to register?</Text>
        </Animated.View>

        {options.map((opt, index) => (
          <Animated.View
            key={opt.key}
            entering={FadeInDown.delay(200 + index * 80).duration(ENTER_DURATION)}
          >
            <TouchableOpacity
              testID={`register-option-${opt.key}`}
              activeOpacity={0.8}
              onPress={opt.onPress}
              style={styles.card}
              accessibilityRole="button"
              accessibilityLabel={opt.title}
            >
              <View style={styles.iconCircle}>
                <Icon name={opt.icon} size={26} color={AUTH_COLORS.primary} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{opt.title}</Text>
                <Text style={styles.cardSubtitle}>{opt.subtitle}</Text>
              </View>
              <Icon name="chevron-right" size={24} color={AUTH_COLORS.placeholder} />
            </TouchableOpacity>
          </Animated.View>
        ))}

        <Animated.View
          entering={FadeInDown.delay(480).duration(ENTER_DURATION)}
          style={styles.footerRow}
        >
          <Text style={styles.footerMuted}>Already have an account? </Text>
          <TouchableOpacity onPress={goBack} activeOpacity={0.7}>
            <Text style={styles.footerLink}>Login</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: AUTH_COLORS.background,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
    padding: 4,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: AUTH_SPACING.screenHorizontal,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: AUTH_SPACING.logoToWelcome,
    marginBottom: AUTH_SPACING.welcomeToUsername,
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AUTH_COLORS.surface,
    borderWidth: 1,
    borderColor: AUTH_COLORS.inputBorder,
    borderRadius: AUTH_SPACING.inputRadius,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F3EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: AUTH_FONT.semibold,
    color: AUTH_COLORS.textPrimary,
  },
  cardSubtitle: {
    marginTop: 3,
    fontSize: 13,
    fontFamily: AUTH_FONT.regular,
    color: AUTH_COLORS.textSecondary,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  footerMuted: {
    fontSize: AUTH_TYPE.register,
    fontFamily: AUTH_FONT.regular,
    color: AUTH_COLORS.textSecondary,
  },
  footerLink: {
    fontSize: AUTH_TYPE.register,
    fontFamily: AUTH_FONT.medium,
    color: AUTH_COLORS.primary,
  },
});

export default RegisterScreen;
