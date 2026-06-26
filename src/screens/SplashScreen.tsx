import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme, Typography } from '@design-system';
import { useAuthStore } from '@store/authStore';

const SplashScreen: React.FC = () => {
  const { colors } = useTheme();
  const initialize = useAuthStore(state => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <Text style={styles.logo}>🐔</Text>
      <Typography preset="headingLg" style={[styles.title, { color: colors.onPrimary }]}>
        FarmCalcy
      </Typography>
      <Typography preset="bodyMd" style={[styles.subtitle, { color: colors.onPrimary }]}>
        Poultry Contract Farming
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logo: {
    fontSize: 72,
    marginBottom: 8,
  },
  title: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    opacity: 0.85,
  },
});

export default SplashScreen;
