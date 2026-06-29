import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import DrawerHeaderBar from '@navigation/DrawerHeaderBar';

interface ComingSoonScreenProps {
  title: string;
  icon: string;
}

/** Placeholder body for tabs/sections whose screens are not built yet. */
const ComingSoonScreen: React.FC<ComingSoonScreenProps> = ({ title, icon }) => (
  <View style={styles.root}>
    <DrawerHeaderBar title={title} />
    <View style={styles.body}>
      <View style={styles.iconCircle}>
        <Icon name={icon} size={40} color="#2E7D32" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>This section is coming soon.</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  subtitle: { fontSize: 14, color: '#7A7A7A', marginTop: 6 },
});

export default ComingSoonScreen;
