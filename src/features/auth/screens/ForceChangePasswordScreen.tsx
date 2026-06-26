import React from 'react';
import { View } from 'react-native';

import { Typography } from '@design-system';

const ForceChangePasswordScreen: React.FC = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Typography preset="headingMd">Set New Password</Typography>
    <Typography preset="bodyMd">Phase 3 — coming soon</Typography>
  </View>
);

export default ForceChangePasswordScreen;
