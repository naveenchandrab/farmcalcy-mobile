import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import type { Asset } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import Loader from '@components/Loader';
import { ROLE_LABELS } from '@constants';
import { Avatar, Card, Divider, Typography, useTheme } from '@design-system';
import ScreenHeader from '@navigation/ScreenHeader';
import { useAuthStore } from '@store/authStore';

import { useProfile, useUpdateAvatar } from '../hooks/useProfile';

const PICK_OPTIONS = { mediaType: 'photo', quality: 0.7, maxWidth: 1200, maxHeight: 1200 } as const;

interface DetailRowProps {
  icon: string;
  label: string;
  value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ icon, label, value }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.detailRow}>
      <Icon name={icon} size={18} color={colors.textSecondary} style={styles.detailIcon} />
      <View style={styles.detailContent}>
        <Typography preset="bodySm" style={{ color: colors.textSecondary }}>
          {label}
        </Typography>
        <Typography preset="bodyLg" style={{ color: colors.textPrimary, fontWeight: '500' }}>
          {value}
        </Typography>
      </View>
    </View>
  );
};

/**
 * Self-service "my profile" screen — reachable by tapping the drawer's
 * profile tile. Shows the full current-user record (fetched fresh from
 * /auth/me, since the auth-store snapshot omits phone/avatar until this
 * fetch resolves) and lets the user replace their profile photo.
 */
const ProfileScreen: React.FC = () => {
  const { colors } = useTheme();
  const storeUser = useAuthStore(s => s.user);
  const { data: fetchedUser, isLoading } = useProfile();
  const { mutate: updateAvatar, isPending: isUploadingAvatar } = useUpdateAvatar();

  // Show the store snapshot immediately, then upgrade in place once /auth/me resolves.
  const user = fetchedUser ?? storeUser;

  const uploadPicked = useCallback(
    (asset: Asset | undefined) => {
      if (!asset?.uri) {
        return;
      }
      updateAvatar({ uri: asset.uri, type: asset.type, fileName: asset.fileName });
    },
    [updateAvatar],
  );

  const choosePhoto = useCallback(() => {
    Alert.alert('Profile Photo', 'Update your profile photo', [
      {
        text: 'Take Photo',
        onPress: () => {
          void launchCamera(PICK_OPTIONS).then(r => uploadPicked(r.assets?.[0]));
        },
      },
      {
        text: 'Choose from Gallery',
        onPress: () => {
          void launchImageLibrary(PICK_OPTIONS).then(r => uploadPicked(r.assets?.[0]));
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [uploadPicked]);

  if (isLoading && !user) {
    return <Loader message="Loading profile…" />;
  }

  if (!user) {
    return null;
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScreenHeader title="My Profile" variant="back" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={choosePhoto}
            disabled={isUploadingAvatar}
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
            style={styles.avatarWrap}
          >
            <Avatar
              name={user.name}
              imageUri={user.avatarUrl ?? undefined}
              size="xl"
              backgroundColor="#E2E5E2"
              textColor="#9AA0A6"
              placeholderIcon
            />
            <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}>
              {isUploadingAvatar ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Icon name="camera" size={14} color="#FFFFFF" />
              )}
            </View>
          </TouchableOpacity>
          <Typography preset="headingSm" style={{ marginTop: 12, color: colors.textPrimary }}>
            {user.name}
          </Typography>
          <Typography preset="bodySm" style={{ color: colors.textSecondary }}>
            {ROLE_LABELS[user.role] ?? user.role}
          </Typography>
        </View>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Typography preset="bodyLg" style={{ color: colors.textPrimary, fontWeight: '600' }}>
              Profile Information
            </Typography>
          </View>
          <Divider />
          <View style={styles.cardContent}>
            <DetailRow icon="account-outline" label="Full Name" value={user.name} />
            <DetailRow icon="email-outline" label="Email Address" value={user.email} />
            {user.phone && (
              <DetailRow icon="phone-outline" label="Mobile Number" value={user.phone} />
            )}
            <DetailRow
              icon="shield-account-outline"
              label="Role"
              value={ROLE_LABELS[user.role] ?? user.role}
            />
            <DetailRow
              icon="calendar-outline"
              label="Member Since"
              value={new Date(user.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            />
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 16 },
  avatarSection: { alignItems: 'center', paddingVertical: 12 },
  avatarWrap: { position: 'relative' },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  card: { borderRadius: 12 },
  cardHeader: { padding: 16, paddingBottom: 12 },
  cardContent: { padding: 16, gap: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  detailIcon: { marginTop: 2 },
  detailContent: { flex: 1, gap: 2 },
});

export default ProfileScreen;
