import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  PASSWORD_RULES,
  evaluatePasswordStrength,
  type PasswordStrength,
} from '../utils/passwordPolicy';

import { AUTH_COLORS, AUTH_FONT } from './authTokens';

interface PasswordStrengthMeterProps {
  password: string;
}

const STRENGTH_META: Record<PasswordStrength, { label: string; color: string }> = {
  weak: { label: 'Weak', color: AUTH_COLORS.error },
  fair: { label: 'Fair', color: '#F59E0B' },
  strong: { label: 'Strong', color: AUTH_COLORS.primary },
};

const BAR_SEGMENTS = 4;

/**
 * Visual feedback for a new password: a 4-segment strength bar plus a live
 * checklist of the required policy rules. Presentation only — submission is
 * gated by the zod schema (`isPasswordValid`), not by this component.
 */
const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const { score, level } = evaluatePasswordStrength(password);
  const meta = STRENGTH_META[level];
  const filledSegments = password ? Math.max(1, Math.min(score, BAR_SEGMENTS)) : 0;

  return (
    <View style={styles.container} accessible accessibilityLabel={`Password strength: ${meta.label}`}>
      <View style={styles.barRow}>
        {Array.from({ length: BAR_SEGMENTS }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.segment,
              {
                backgroundColor:
                  index < filledSegments ? meta.color : AUTH_COLORS.inputBorder,
              },
            ]}
          />
        ))}
        {password ? (
          <Text style={[styles.strengthLabel, { color: meta.color }]}>{meta.label}</Text>
        ) : null}
      </View>

      <View style={styles.rules}>
        {PASSWORD_RULES.map(rule => {
          const passed = rule.test(password);
          return (
            <View key={rule.id} style={styles.ruleRow}>
              <Icon
                name={passed ? 'check-circle' : 'circle-outline'}
                size={15}
                color={passed ? AUTH_COLORS.primary : AUTH_COLORS.placeholder}
              />
              <Text
                style={[
                  styles.ruleText,
                  { color: passed ? AUTH_COLORS.textPrimary : AUTH_COLORS.textSecondary },
                ]}
              >
                {rule.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  segment: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    marginRight: 6,
  },
  strengthLabel: {
    marginLeft: 4,
    minWidth: 48,
    textAlign: 'right',
    fontSize: 12,
    fontFamily: AUTH_FONT.semibold,
  },
  rules: {
    marginTop: 12,
    gap: 6,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ruleText: {
    fontSize: 13,
    fontFamily: AUTH_FONT.regular,
  },
});

export default memo(PasswordStrengthMeter);
