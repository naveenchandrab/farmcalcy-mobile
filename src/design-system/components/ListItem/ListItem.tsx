import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '../../theme';
import { layout } from '../../tokens/spacing';
import Divider from '../Divider/Divider';
import Typography from '../Typography/Typography';

interface ListItemProps {
  title: string;
  subtitle?: string;
  /** Slot for left icon name (MaterialCommunityIcons) or any React node */
  left?: string | React.ReactNode;
  /** Slot for right content — defaults to chevron */
  right?: React.ReactNode;
  showChevron?: boolean;
  showDivider?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  /** Use for danger items like Logout */
  destructive?: boolean;
}

/**
 * ListItem — standard row for menus, settings, and detail lists.
 * Matches the "More" screen pattern in the UI reference.
 *
 * Usage:
 *   <ListItem
 *     title="Farm Profile"
 *     left="barn"
 *     onPress={() => navigation.navigate('FarmProfile')}
 *   />
 *   <ListItem title="Logout" left="logout" destructive onPress={handleLogout} />
 */
const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  left,
  right,
  showChevron = true,
  showDivider = true,
  onPress,
  disabled = false,
  destructive = false,
}) => {
  const { colors } = useTheme();

  const titleColor = destructive ? colors.error : colors.textPrimary;

  const leftSlot =
    typeof left === 'string' ? (
      <View style={[styles.iconCircle, { backgroundColor: destructive ? colors.errorContainer : colors.primaryContainer }]}>
        <Icon name={left} size={20} color={destructive ? colors.error : colors.primary} />
      </View>
    ) : (
      left
    );

  const content = (
    <View style={[styles.row, { height: layout.listItemHeight }]}>
      {leftSlot && <View style={styles.left}>{leftSlot}</View>}

      <View style={styles.content}>
        <Typography preset="bodyLg" style={{ color: titleColor, fontWeight: '500' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography preset="bodySm" color={colors.textSecondary}>
            {subtitle}
          </Typography>
        )}
      </View>

      <View style={styles.right}>
        {right ?? (showChevron && (
          <Icon name="chevron-right" size={20} color={colors.textDisabled} />
        ))}
      </View>
    </View>
  );

  return (
    <>
      {onPress ? (
        <TouchableOpacity
          onPress={onPress}
          disabled={disabled}
          activeOpacity={0.7}
          style={[styles.touchable, disabled && styles.disabled]}
        >
          {content}
        </TouchableOpacity>
      ) : (
        <View style={styles.touchable}>{content}</View>
      )}
      {showDivider && <Divider />}
    </>
  );
};

const styles = StyleSheet.create({
  touchable: { paddingHorizontal: 16 },
  disabled: { opacity: 0.5 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  left: {},
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, gap: 2 },
  right: { alignItems: 'flex-end' },
});

export default ListItem;
