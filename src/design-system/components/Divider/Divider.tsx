import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  color?: string;
  marginV?: number;
}

const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  thickness = StyleSheet.hairlineWidth,
  color,
  marginV = 0,
}) => {
  const { colors } = useTheme();
  const borderColor = color ?? colors.border;

  if (orientation === 'vertical') {
    return (
      <View style={[styles.vertical, { borderLeftWidth: thickness, borderColor, marginHorizontal: 8 }]} />
    );
  }

  return (
    <View
      style={[
        styles.horizontal,
        { borderBottomWidth: thickness, borderColor, marginVertical: marginV },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  horizontal: { width: '100%' },
  vertical: { alignSelf: 'stretch' },
});

export default Divider;
