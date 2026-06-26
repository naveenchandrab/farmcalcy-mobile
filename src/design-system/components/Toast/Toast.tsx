import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { radius } from '../../tokens/radius';
import { shadows } from '../../tokens/shadows';
import { zIndex } from '../../tokens/zIndex';
import Typography from '../Typography/Typography';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastConfig {
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  show: (config: ToastConfig) => void;
  hide: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue>({
  show: () => undefined,
  hide: () => undefined,
});

// ─── Type styles ─────────────────────────────────────────────────────────────

const TYPE_STYLES: Record<ToastType, { bg: string; icon: string; iconColor: string }> = {
  success: { bg: '#1B3D1B', icon: 'check-circle', iconColor: '#81C784' },
  error: { bg: '#7F0000', icon: 'alert-circle', iconColor: '#EF9A9A' },
  info: { bg: '#0D2744', icon: 'information', iconColor: '#64B5F6' },
  warning: { bg: '#4A3800', icon: 'alert', iconColor: '#FFD54F' },
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback((): void => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -20, duration: 200, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, [opacity, translateY]);

  const show = useCallback(
    (config: ToastConfig): void => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setToast(config);
      opacity.setValue(0);
      translateY.setValue(-20);

      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();

      timeoutRef.current = setTimeout(hide, config.duration ?? 3000);
    },
    [hide, opacity, translateY],
  );

  const typeStyle = toast ? TYPE_STYLES[toast.type] : TYPE_STYLES.info;

  return (
    <ToastContext.Provider value={{ show, hide }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.container,
            shadows.md,
            {
              backgroundColor: typeStyle.bg,
              opacity,
              transform: [{ translateY }],
              zIndex: zIndex.toast,
            },
          ]}
        >
          <Icon name={typeStyle.icon} size={20} color={typeStyle.iconColor} />
          <Typography preset="bodyMd" style={[styles.message, { color: '#FFFFFF' }]}>
            {toast.message}
          </Typography>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useToast = (): ToastContextValue => useContext(ToastContext);

// ─── Imperative API ───────────────────────────────────────────────────────────

/** Reference stored by ToastProvider so imperative calls work outside React components. */
let _toastRef: ToastContextValue | null = null;

export const setToastRef = (ref: ToastContextValue): void => {
  _toastRef = ref;
};

export const showSuccess = (message: string, duration?: number): void => {
  _toastRef?.show({ type: 'success', message, duration });
};

export const showError = (message: string, duration?: number): void => {
  _toastRef?.show({ type: 'error', message, duration });
};

export const showInfo = (message: string, duration?: number): void => {
  _toastRef?.show({ type: 'info', message, duration });
};

export const showWarning = (message: string, duration?: number): void => {
  _toastRef?.show({ type: 'warning', message, duration });
};

export const hideToast = (): void => {
  _toastRef?.hide();
};

// ─── Bridge component — renders inside ToastProvider and sets the ref ─────────

export const ToastBridge: React.FC = () => {
  const ctx = useToast();
  React.useEffect(() => {
    setToastRef(ctx);
  }, [ctx]);
  return null;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  message: { flex: 1 },
});
