import React from 'react';
import {
  KeyboardAvoidingView,
  Modal as RNModal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../../theme';
import { radius } from '../../tokens/radius';
import { shadows } from '../../tokens/shadows';
import { zIndex } from '../../tokens/zIndex';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Whether tapping the backdrop dismisses the modal. */
  dismissible?: boolean;
  contentStyle?: ViewStyle;
}

/**
 * Modal — accessible overlay with backdrop dismiss and keyboard avoidance.
 * Renders children in a centred white card over a semi-transparent scrim.
 *
 * Usage:
 *   <Modal visible={showModal} onClose={() => setShowModal(false)}>
 *     <Typography preset="headingMd">Title</Typography>
 *     <Button onPress={handleConfirm}>Confirm</Button>
 *   </Modal>
 */
const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  children,
  dismissible = true,
  contentStyle,
}) => {
  const { colors } = useTheme();

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={dismissible ? onClose : undefined}
        />

        {/* Content card */}
        <View
          style={[
            styles.card,
            shadows.xl,
            {
              backgroundColor: colors.surface,
              borderRadius: radius.xl,
              zIndex: zIndex.modal,
            },
            contentStyle,
          ]}
        >
          {children}
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  card: {
    width: '88%',
    maxWidth: 420,
    padding: 24,
  },
});

export default Modal;
