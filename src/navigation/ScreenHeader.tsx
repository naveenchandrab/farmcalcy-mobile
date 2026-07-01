import { DrawerActions, useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { TEST_IDS } from '@constants/testIDs';

const HEADER_GREEN = '#1E8038';
const hit = { top: 8, bottom: 8, left: 8, right: 8 };

interface ScreenHeaderProps {
  title: string;
  /**
   * `dashboard` — the home tab: hamburger (opens the drawer) on the left and a
   * notification bell on the right.
   * `back` (default) — every other screen: a back arrow + title, plus an
   * optional right-side action (e.g. a `+` to add).
   */
  variant?: 'dashboard' | 'back';
  /** Right-side action icon for the `back` variant (e.g. `plus`, `calendar-blank-outline`). */
  rightIcon?: string;
  /** Accessibility label for the right action (defaults to "Action"). */
  rightLabel?: string;
  onRightPress?: () => void;
  onBellPress?: () => void;
  /** Content rendered below the top row (e.g. a greeting block on the dashboard). */
  children?: React.ReactNode;
  /** Extra bottom padding for the green band (defaults to 16). */
  paddingBottom?: number;
}

/**
 * Shared green app-bar. Only the dashboard exposes the hamburger + bell; all
 * other screens get a back button and title, with an optional action on the
 * right. Reused so the header looks identical across the role's screens.
 */
const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  variant = 'back',
  rightIcon,
  rightLabel = 'Action',
  onRightPress,
  onBellPress,
  children,
  paddingBottom = 16,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const onBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Tab roots have no stack history — fall back to the Dashboard tab.
      navigation.navigate('DashboardTab' as never);
    }
  };

  return (
    <View style={[styles.header, { paddingTop: insets.top + 10, paddingBottom }]}>
      <View style={styles.row}>
        {variant === 'dashboard' ? (
          <TouchableOpacity
            testID={TEST_IDS.session.openMenuButton}
            hitSlop={hit}
            style={styles.leftBtn}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          >
            <Icon name="menu" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            hitSlop={hit}
            style={styles.leftBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={onBack}
          >
            <Icon name="arrow-left" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        <Text style={styles.title}>{title}</Text>
        <View style={styles.flex} />

        {variant === 'dashboard' && rightIcon && (
          <TouchableOpacity
            hitSlop={hit}
            accessibilityRole="button"
            accessibilityLabel={rightLabel}
            onPress={onRightPress}
          >
            <Icon name={rightIcon} size={26} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {variant === 'dashboard' && !rightIcon && (
          <TouchableOpacity
            hitSlop={hit}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            onPress={onBellPress}
          >
            <Icon name="bell-outline" size={24} color="#FFFFFF" />
            <View style={styles.bellDot} />
          </TouchableOpacity>
        )}

        {variant === 'back' && rightIcon && (
          <TouchableOpacity
            hitSlop={hit}
            accessibilityRole="button"
            accessibilityLabel={rightLabel}
            onPress={onRightPress}
          >
            <Icon name={rightIcon} size={26} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, backgroundColor: HEADER_GREEN },
  row: { flexDirection: 'row', alignItems: 'center', height: 40 },
  flex: { flex: 1 },
  leftBtn: { marginRight: 16 },
  title: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  bellDot: {
    position: 'absolute',
    top: 0,
    right: 1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
    borderWidth: 1,
    borderColor: HEADER_GREEN,
  },
});

export default ScreenHeader;
