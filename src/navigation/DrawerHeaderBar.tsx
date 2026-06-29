import { DrawerActions, useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const HEADER_GREEN = '#1E8038';

const hit = { top: 8, bottom: 8, left: 8, right: 8 };

interface DrawerHeaderBarProps {
  title: string;
  /** Optional content rendered below the top row (e.g. a greeting block). */
  children?: React.ReactNode;
  /** Extra bottom padding for the green band (defaults to 16). */
  paddingBottom?: number;
}

/**
 * Shared green header used across the SAAS_ADMIN tab screens. The hamburger
 * opens the surrounding Drawer (the "hamburger menu"); the bell is a
 * notifications affordance. Reused so every tab exposes the drawer identically.
 */
const DrawerHeaderBar: React.FC<DrawerHeaderBarProps> = ({
  title,
  children,
  paddingBottom = 16,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 10, paddingBottom }]}>
      <View style={styles.row}>
        <TouchableOpacity
          hitSlop={hit}
          style={styles.menuBtn}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Icon name="menu" size={26} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.flex} />
        <TouchableOpacity
          hitSlop={hit}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <Icon name="bell-outline" size={24} color="#FFFFFF" />
          <View style={styles.bellDot} />
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, backgroundColor: HEADER_GREEN },
  row: { flexDirection: 'row', alignItems: 'center', height: 40 },
  flex: { flex: 1 },
  menuBtn: { marginRight: 16 },
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

export default DrawerHeaderBar;
