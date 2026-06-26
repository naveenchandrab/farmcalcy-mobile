import React from 'react';
import { View } from 'react-native';

import { Typography } from '@design-system';

const OtpVerificationScreen: React.FC = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Typography preset="headingMd">OTP Verification</Typography>
    <Typography preset="bodyMd">Phase 3 — coming soon</Typography>
  </View>
);

export default OtpVerificationScreen;
