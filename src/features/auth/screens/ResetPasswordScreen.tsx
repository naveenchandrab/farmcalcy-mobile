import React from 'react';
import { View } from 'react-native';

import { Typography } from '@design-system';

const ResetPasswordScreen: React.FC = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Typography preset="headingMd">Reset Password</Typography>
    <Typography preset="bodyMd">Phase 3 — coming soon</Typography>
  </View>
);

export default ResetPasswordScreen;
