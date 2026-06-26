import React from 'react';
import { StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '../../theme';
import Button from '../Button/Button';
import Typography from '../Typography/Typography';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox-outline',
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const { colors, spacing } = useTheme();

  return (
    <View style={[styles.container, { paddingVertical: spacing[12] }]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.primaryContainer }]}>
        <Icon name={icon} size={40} color={colors.primary} />
      </View>

      <Typography
        preset="headingMd"
        style={[styles.title, { color: colors.textPrimary, marginTop: spacing[4] }]}
      >
        {title}
      </Typography>

      {description && (
        <Typography
          preset="bodyMd"
          color={colors.textSecondary}
          style={[styles.description, { marginTop: spacing[2] }]}
        >
          {description}
        </Typography>
      )}

      {actionLabel && onAction && (
        <Button
          onPress={onAction}
          variant="outline"
          style={{ marginTop: spacing[6] }}
        >
          {actionLabel}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default EmptyState;
