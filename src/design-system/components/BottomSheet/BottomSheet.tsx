import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../../theme';
import { radius } from '../../tokens/radius';
import { shadows } from '../../tokens/shadows';
import { zIndex } from '../../tokens/zIndex';
import Typography from '../Typography/Typography';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  /** Snap point as % of screen height. Default 50%. */
  snapPoint?: number;
  contentStyle?: ViewStyle;
}

/**
 * BottomSheet — drag-to-dismiss sheet for pickers, action menus, detail previews.
 * Drag handle at top; tapping backdrop or swiping down closes the sheet.
 *
 * Usage:
 *   <BottomSheet visible={open} onClose={() => setOpen(false)} snapPoint={60}>
 *     <RolePickerList />
 *   </BottomSheet>
 */
const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  title,
  snapPoint = 50,
  contentStyle,
}) => {
  const { colors } = useTheme();
  const sheetHeight = SCREEN_HEIGHT * (snapPoint / 100);
  const translateY = useRef(new Animated.Value(sheetHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 2,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: sheetHeight,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, sheetHeight, translateY, backdropOpacity]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 10,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) {
          translateY.setValue(g.dy);
        }
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > sheetHeight * 0.3 || g.vy > 0.5) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          shadows['2xl'],
          {
            height: sheetHeight,
            backgroundColor: colors.surface,
            borderTopLeftRadius: radius['3xl'],
            borderTopRightRadius: radius['3xl'],
            transform: [{ translateY }],
            zIndex: zIndex.bottomSheet,
          },
          contentStyle,
        ]}
        {...panResponder.panHandlers}
      >
        {/* Drag handle */}
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
        {title && (
          <Typography preset="headingSm" style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
            {title}
          </Typography>
        )}
        {children}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginVertical: 8,
  },
});

export default BottomSheet;
