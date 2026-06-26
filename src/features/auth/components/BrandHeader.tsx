import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '@design-system';

const BrandHeader: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primaryContainer }]}>
          <Icon name="bird" size={40} color={colors.primary} />
        </View>
        <View style={styles.logoText}>
          <Text style={[styles.logoTitle, { color: colors.primary }]}>PCFMS</Text>
          <Text style={[styles.logoTagline, { color: colors.secondary }]}>
            POULTRY CONTRACT FARMING{'\n'}MANAGEMENT SYSTEM
          </Text>
        </View>
      </View>

      <View style={styles.illustration}>
        <Icon name="barn" size={72} color={colors.secondary} style={styles.barnIcon} />
        <View style={styles.chickRow}>
          <Icon name="emoticon-happy-outline" size={28} color={colors.financial} />
          <Icon name="emoticon-happy-outline" size={36} color={colors.secondary} />
          <Icon name="emoticon-happy-outline" size={28} color={colors.financial} />
        </View>
      </View>

      <Text style={[styles.welcome, { color: colors.textPrimary }]}>Welcome Back!</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Login to continue</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    gap: 2,
  },
  logoTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
  },
  logoTagline: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.8,
    lineHeight: 13,
  },
  illustration: {
    alignItems: 'center',
    marginVertical: 12,
  },
  barnIcon: {
    opacity: 0.85,
  },
  chickRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  welcome: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default BrandHeader;
