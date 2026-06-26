import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../tokens/spacing';
import Button from '../Button/Button';
import Divider from '../Divider/Divider';
import Modal from '../Modal/Modal';
import Typography from '../Typography/Typography';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * ConfirmDialog — title, body, confirm + cancel actions.
 * Uses the custom Modal component — no external dependency.
 *
 * Usage:
 *   <ConfirmDialog
 *     visible={showLogout}
 *     title="Logout"
 *     message="Are you sure you want to logout?"
 *     destructive
 *     onConfirm={handleLogout}
 *     onCancel={() => setShowLogout(false)}
 *   />
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}) => (
  <Modal visible={visible} onClose={onCancel} dismissible={!loading}>
    <Typography preset="headingSm" style={styles.title}>{title}</Typography>
    <Typography preset="bodyMd" style={styles.message}>{message}</Typography>
    <Divider marginV={16} />
    <View style={styles.actions}>
      <Button
        variant="ghost"
        onPress={onCancel}
        disabled={loading}
        style={styles.cancelBtn}
      >
        {cancelLabel}
      </Button>
      <Button
        variant={destructive ? 'danger' : 'primary'}
        onPress={onConfirm}
        loading={loading}
        style={styles.confirmBtn}
      >
        {confirmLabel}
      </Button>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  title: { marginBottom: spacing[2] },
  message: { lineHeight: 22 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[2],
  },
  cancelBtn: { minWidth: 80 },
  confirmBtn: { minWidth: 100 },
});

export default ConfirmDialog;
