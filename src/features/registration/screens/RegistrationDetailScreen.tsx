import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import ScreenHeader from '@navigation/ScreenHeader';
import type { RegistrationsScreenProps } from '@navigation/types';
import { useAuthStore } from '@store/authStore';

import AadhaarImageView from '../components/AadhaarImageView';
import {
  useApproveRegistration,
  useRegistration,
  useRejectRegistration,
} from '../hooks/useRegistrationReview';
import { REGISTRATION_TYPE_LABEL } from '../types';
import type { RegistrationResponse, RegistrationStatus } from '../types';

const GREEN = '#1E8038';
const RED = '#D32F2F';
const MUTED = '#7A7A7A';

type Props = RegistrationsScreenProps<'RegistrationApprovalDetail'>;

const STATUS_BADGE: Record<RegistrationStatus, { text: string; bg: string; label: string }> = {
  PENDING: { text: '#B26A00', bg: '#FFF8E1', label: 'Pending' },
  APPROVED: { text: '#2E7D32', bg: '#E8F5E9', label: 'Approved' },
  REJECTED: { text: RED, bg: '#FFEBEE', label: 'Rejected' },
};

const Row: React.FC<{ label: string; value?: string | null; link?: string }> = ({
  label,
  value,
  link,
}) => {
  if (!value) {
    return null;
  }
  const inner = (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, link && styles.rowLink]}>{value}</Text>
    </View>
  );
  if (link) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={() => void Linking.openURL(link)}>
        {inner}
      </TouchableOpacity>
    );
  }
  return inner;
};

const RegistrationDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { id } = route.params;
  const currentUser = useAuthStore(s => s.user);
  const { data, isLoading } = useRegistration(id);
  const { mutate: approve, isPending: approving } = useApproveRegistration(id);
  const { mutate: reject, isPending: rejecting } = useRejectRegistration(id);

  const [rejectVisible, setRejectVisible] = useState(false);
  const [reason, setReason] = useState('');

  const onApprove = useCallback(() => {
    approve(undefined, { onSuccess: () => navigation.goBack() });
  }, [approve, navigation]);

  const onConfirmReject = useCallback(() => {
    reject(reason.trim() || undefined, {
      onSuccess: () => {
        setRejectVisible(false);
        navigation.goBack();
      },
    });
  }, [reject, reason, navigation]);

  const renderContent = (req: RegistrationResponse) => {
    const badge = STATUS_BADGE[req.status];
    const isPending = req.status === 'PENDING';
    const isSelfSubmitted =
      Boolean(req.submittedByUserId) && req.submittedByUserId === currentUser?.id;
    const gps =
      typeof req.gpsLatitude === 'number' && typeof req.gpsLongitude === 'number'
        ? `${req.gpsLatitude}, ${req.gpsLongitude}`
        : null;

    return (
      <>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.headerCard}>
            <Text style={styles.name}>
              {req.firstName} {req.lastName}
            </Text>
            <Text style={styles.type}>{REGISTRATION_TYPE_LABEL[req.requestType]} registration</Text>
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>
            {req.requestType === 'TENANT' ? 'Owner / Founder (as per Aadhaar)' : 'Applicant'}
          </Text>
          <View style={styles.card}>
            <Row label="Name" value={`${req.firstName} ${req.lastName}`} />
            <Row label="Phone" value={req.phoneNumber} link={`tel:${req.phoneNumber}`} />
            <Row
              label="Email"
              value={req.email ?? '— (phone only)'}
              link={req.email ? `mailto:${req.email}` : undefined}
            />
            <Row label="Requested role" value={req.requestedRole} />
          </View>

          {req.requestType === 'TENANT' ? (
            <>
              <Text style={styles.sectionLabel}>Company</Text>
              <View style={styles.card}>
                <Row label="Name" value={req.companyName} />
                <Row
                  label="Email"
                  value={req.companyEmail}
                  link={req.companyEmail ? `mailto:${req.companyEmail}` : undefined}
                />
                <Row
                  label="Phone"
                  value={req.companyPhone}
                  link={req.companyPhone ? `tel:${req.companyPhone}` : undefined}
                />
                <Row label="GST" value={req.gstNumber} />
                <Row label="HQ GPS" value={gps} />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.sectionLabel}>Company</Text>
              <View style={styles.card}>
                <Row label="Company" value={req.companyName} />
                <Row label="Company code" value={req.companyCode} />
                <Row label="Farm GPS" value={gps} />
              </View>
            </>
          )}

          <Text style={styles.sectionLabel}>
            {req.requestType === 'TENANT' ? 'Company address' : 'Address'}
          </Text>
          <View style={styles.card}>
            <Row label="Address line 1" value={req.addressLine1} />
            <Row label="Address line 2" value={req.addressLine2} />
            <Row label="Village" value={req.village} />
            <Row label="Taluk" value={req.taluk} />
            <Row label="Landmark" value={req.landmark} />
            <Row label="District" value={req.district} />
            <Row label="State" value={req.state} />
            <Row label="PIN code" value={req.pincode} />
          </View>

          {req.requestType === 'TENANT' && (req.aadhaarFrontUrl || req.aadhaarBackUrl) ? (
            <>
              <Text style={styles.sectionLabel}>Owner Aadhaar</Text>
              <View style={[styles.card, styles.aadhaarCard]}>
                {req.aadhaarFrontUrl ? (
                  <AadhaarImageView label="Front" fileRef={req.aadhaarFrontUrl} />
                ) : null}
                {req.aadhaarBackUrl ? (
                  <AadhaarImageView label="Back" fileRef={req.aadhaarBackUrl} />
                ) : null}
              </View>
            </>
          ) : null}

          {req.status === 'APPROVED' && req.approvalNotes ? (
            <>
              <Text style={styles.sectionLabel}>Approval notes</Text>
              <View style={styles.card}>
                <Text style={styles.reason}>{req.approvalNotes}</Text>
              </View>
            </>
          ) : null}

          {req.status === 'REJECTED' && req.rejectionReason ? (
            <>
              <Text style={styles.sectionLabel}>Rejection reason</Text>
              <View style={styles.card}>
                <Text style={styles.reason}>{req.rejectionReason}</Text>
              </View>
            </>
          ) : null}

          {req.ipAddress || req.sourceDevice ? (
            <Text style={styles.audit}>
              Submitted from {req.sourceDevice ?? 'unknown device'}
              {req.ipAddress ? ` · ${req.ipAddress}` : ''}
            </Text>
          ) : null}
        </ScrollView>

        {isPending && isSelfSubmitted && (
          <View style={styles.selfReviewBanner}>
            <Text style={styles.selfReviewText}>
              You cannot approve or reject this registration because you submitted it. Another SaaS
              admin must review it.
            </Text>
          </View>
        )}

        {isPending && !isSelfSubmitted && (
          <View style={styles.actions}>
            <TouchableOpacity
              testID="reject-button"
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => setRejectVisible(true)}
              disabled={approving || rejecting}
            >
              <Text style={styles.rejectText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="approve-button"
              style={[styles.actionBtn, styles.approveBtn]}
              onPress={onApprove}
              disabled={approving || rejecting}
            >
              {approving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.approveText}>Approve</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </>
    );
  };

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Registration" variant="back" />

      {isLoading || !data ? (
        <View style={styles.center}>
          <ActivityIndicator color={GREEN} />
        </View>
      ) : (
        renderContent(data)
      )}

      <Modal
        visible={rejectVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reject registration</Text>
            <Text style={styles.modalSubtitle}>
              Optionally add a reason. It will be included in the applicant&apos;s notification.
            </Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="Reason (optional)"
              placeholderTextColor="#A5A5A5"
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setRejectVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="confirm-reject-button"
                style={styles.modalReject}
                onPress={onConfirmReject}
                disabled={rejecting}
              >
                {rejecting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalRejectText}>Reject</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F7F9F7' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 16, paddingBottom: 24, gap: 8 },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  type: { fontSize: 13, color: MUTED, marginTop: 2 },
  badge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, marginTop: 10 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: GREEN,
    marginTop: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 4 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEEEEE',
    gap: 16,
  },
  rowLabel: { fontSize: 14, color: MUTED },
  rowValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
    flexShrink: 1,
    textAlign: 'right',
  },
  rowLink: { color: GREEN },
  reason: { fontSize: 14, color: '#1A1A1A', paddingVertical: 12, lineHeight: 20 },
  aadhaarCard: { flexDirection: 'row', gap: 12, paddingVertical: 12 },
  audit: { fontSize: 11, color: '#9AA0A6', marginTop: 8, textAlign: 'center' },
  selfReviewBanner: {
    margin: 16,
    padding: 14,
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  selfReviewText: {
    fontSize: 13,
    color: '#6D4C00',
    lineHeight: 19,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E6E6E6',
  },
  actionBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveBtn: { backgroundColor: GREEN },
  approveText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  rejectBtn: { backgroundColor: '#FBEBEA' },
  rejectText: { color: RED, fontSize: 15, fontWeight: '700' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  modalSubtitle: { fontSize: 13, color: MUTED, marginTop: 6, lineHeight: 18 },
  reasonInput: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    fontSize: 14,
    color: '#1A1A1A',
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  modalCancel: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F1',
  },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: '#3A3A3A' },
  modalReject: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: RED,
  },
  modalRejectText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});

export default RegistrationDetailScreen;
