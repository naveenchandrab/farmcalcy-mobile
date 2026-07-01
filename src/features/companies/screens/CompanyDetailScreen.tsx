import Clipboard from '@react-native-clipboard/clipboard';
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import ScreenHeader from '@navigation/ScreenHeader';
import type { SaasAdminScreenProps } from '@navigation/types';
import { showSuccess } from '@utils/toast';

import { useCompanyDetail } from '../hooks/useCompanies';
import type { SubscriptionStatus } from '../types';

type Props = SaasAdminScreenProps<'CompanyDetails'>;

const GREEN = '#1E8038';
const MUTED = '#7A7A7A';
const BORDER = '#ECECEC';

const SUB_BADGE: Record<SubscriptionStatus, { text: string; bg: string }> = {
  TRIAL: { text: '#B26A00', bg: '#FFF8E1' },
  ACTIVE: { text: '#2E7D32', bg: '#E8F5E9' },
  EXPIRED: { text: '#C62828', bg: '#FFEBEE' },
  SUSPENDED: { text: '#C62828', bg: '#FFEBEE' },
  CANCELLED: { text: '#616161', bg: '#F5F5F5' },
};

interface InfoRowProps {
  icon: string;
  label: string;
  value: string | null | undefined;
  onPress?: () => void;
  actionIcon?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value, onPress, actionIcon }) => {
  if (!value) {
    return null;
  }

  const content = (
    <View style={styles.infoRow}>
      <Icon name={icon} size={18} color={GREEN} style={styles.infoIcon} />
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, onPress && styles.infoValueLink]}>{value}</Text>
      </View>
      {actionIcon ? (
        <Icon name={actionIcon} size={16} color={GREEN} style={styles.actionIcon} />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
};

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

const formatDate = (iso: string | null | undefined): string | null => {
  if (!iso) {
    return null;
  }
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const CompanyDetailScreen: React.FC<Props> = ({ route }) => {
  const { companyId } = route.params;
  const { data: company, isLoading, isError, refetch } = useCompanyDetail(companyId);

  const copyCode = useCallback(() => {
    if (!company) {
      return;
    }
    Clipboard.setString(company.code);
    showSuccess(`Company code ${company.code} copied to clipboard`);
  }, [company]);

  const openPhone = useCallback((phone: string) => {
    void Linking.openURL(`tel:${phone}`);
  }, []);

  const openEmail = useCallback((email: string) => {
    void Linking.openURL(`mailto:${email}`);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.flex}>
        <ScreenHeader title="Company Details" variant="back" />
        <View style={styles.center}>
          <ActivityIndicator color={GREEN} />
        </View>
      </View>
    );
  }

  if (isError || !company) {
    return (
      <View style={styles.flex}>
        <ScreenHeader title="Company Details" variant="back" />
        <View style={styles.center}>
          <Icon name="alert-circle-outline" size={48} color="#C4C9C4" />
          <Text style={styles.errorText}>Failed to load company details.</Text>
          <Text style={styles.retryLink} onPress={() => void refetch()}>
            Tap to retry
          </Text>
        </View>
      </View>
    );
  }

  const badge = SUB_BADGE[company.subscriptionStatus];
  const initial = company.name.charAt(0).toUpperCase();
  const address = [company.addressLine1, company.district, company.state]
    .filter(Boolean)
    .join(', ');

  return (
    <View style={styles.flex}>
      <ScreenHeader title={company.name} variant="back" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Identity card */}
        <View style={styles.identityCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
          <View style={styles.identityBody}>
            <Text style={styles.companyName}>{company.name}</Text>
            <TouchableOpacity
              style={styles.codeRow}
              activeOpacity={0.7}
              onPress={copyCode}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.companyCode}>{company.code}</Text>
              <Icon name="content-copy" size={14} color={GREEN} style={styles.copyIcon} />
            </TouchableOpacity>
          </View>
          <View style={styles.statusColumn}>
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.text }]}>
                {company.subscriptionStatus}
              </Text>
            </View>
            <View style={styles.activeRow}>
              <View
                style={[
                  styles.activeDot,
                  { backgroundColor: company.isActive ? GREEN : '#BDBDBD' },
                ]}
              />
              <Text style={[styles.activeLabel, { color: company.isActive ? GREEN : MUTED }]}>
                {company.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>

        {/* Contact */}
        <SectionHeader title="Contact" />
        <View style={styles.section}>
          <InfoRow
            icon="email-outline"
            label="Email"
            value={company.email}
            onPress={company.email ? () => openEmail(company.email) : undefined}
            actionIcon="open-in-new"
          />
          <InfoRow
            icon="phone-outline"
            label="Phone"
            value={company.phone}
            onPress={company.phone ? () => openPhone(company.phone!) : undefined}
            actionIcon="phone-forward-outline"
          />
        </View>

        {/* Address */}
        {address ? (
          <>
            <SectionHeader title="Address" />
            <View style={styles.section}>
              <InfoRow icon="map-marker-outline" label="Address" value={address} />
            </View>
          </>
        ) : null}

        {/* Subscription */}
        <SectionHeader title="Subscription" />
        <View style={styles.section}>
          <InfoRow icon="credit-card-outline" label="Plan" value={company.subscriptionStatus} />
          <InfoRow
            icon="calendar-start"
            label="Start Date"
            value={formatDate(company.subscriptionStartDate)}
          />
          <InfoRow
            icon="calendar-end"
            label="End Date"
            value={formatDate(company.subscriptionEndDate)}
          />
        </View>

        {/* Stats */}
        <SectionHeader title="Stats" />
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{company.userCount}</Text>
            <Text style={styles.statLabel}>Users</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatDate(company.createdAt) ?? '—'}</Text>
            <Text style={styles.statLabel}>Joined</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F7F9F7' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { fontSize: 15, color: MUTED, marginTop: 12, textAlign: 'center' },
  retryLink: { fontSize: 14, color: GREEN, marginTop: 8, fontWeight: '600' },

  content: { padding: 16, gap: 0, paddingBottom: 32 },

  // Identity card
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E8F3EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarInitial: { fontSize: 22, fontWeight: '700', color: GREEN },
  identityBody: { flex: 1 },
  companyName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  codeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 5 },
  companyCode: { fontSize: 12, color: MUTED },
  copyIcon: { opacity: 0.7 },
  statusColumn: { alignItems: 'flex-end', gap: 6 },
  badge: { borderRadius: 6, paddingHorizontal: 9, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  activeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  activeDot: { width: 7, height: 7, borderRadius: 4 },
  activeLabel: { fontSize: 12, fontWeight: '600' },

  // Sections
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  infoIcon: { marginRight: 12, marginTop: 1 },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 12, color: MUTED },
  infoValue: { fontSize: 14, color: '#1A1A1A', marginTop: 2, fontWeight: '500' },
  infoValueLink: { color: GREEN },
  actionIcon: { alignSelf: 'center', marginLeft: 8, opacity: 0.6 },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  statValue: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  statLabel: { fontSize: 12, color: MUTED, marginTop: 4 },
});

export default CompanyDetailScreen;
