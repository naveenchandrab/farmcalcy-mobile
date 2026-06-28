import React, { useState } from 'react';
import {
  ActionSheetIOS,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '../../theme';
import { layout } from '../../tokens/spacing';
import BottomSheet from '../BottomSheet/BottomSheet';
import Divider from '../Divider/Divider';
import Typography from '../Typography/Typography';

export interface SelectOption<T extends string = string> {
  label: string;
  value: T;
}

interface SelectProps<T extends string = string> {
  options: SelectOption<T>[];
  value: T | null;
  onValueChange: (value: T) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
}

function Select<T extends string = string>({
  options,
  value,
  onValueChange,
  placeholder = 'Select an option',
  label,
  error,
  disabled = false,
}: SelectProps<T>): React.ReactElement {
  const { colors, spacing } = useTheme();
  const [sheetOpen, setSheetOpen] = useState(false);

  const selectedLabel = options.find(o => o.value === value)?.label;
  const hasError = Boolean(error);
  const borderColor = hasError ? colors.error : colors.border;

  const handlePress = () => {
    if (disabled) {return;}

    if (Platform.OS === 'ios') {
      const titles = options.map(o => o.label);
      ActionSheetIOS.showActionSheetWithOptions(
        { options: [...titles, 'Cancel'], cancelButtonIndex: titles.length },
        index => {
          if (index < titles.length) {
            onValueChange(options[index].value);
          }
        },
      );
    } else {
      setSheetOpen(true);
    }
  };

  return (
    <View>
      {label && (
        <Typography
          preset="labelMd"
          style={{ color: colors.textSecondary, marginBottom: spacing[1] }}
        >
          {label}
        </Typography>
      )}

      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={[
          styles.trigger,
          {
            height: layout.inputHeight,
            borderColor,
            backgroundColor: disabled ? colors.surfaceVariant : colors.surface,
            paddingHorizontal: spacing[4],
          },
        ]}
      >
        <Typography
          preset="bodyMd"
          style={{ flex: 1, color: selectedLabel ? colors.textPrimary : colors.textDisabled }}
        >
          {selectedLabel ?? placeholder}
        </Typography>
        <Icon name="chevron-down" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      {hasError && (
        <Typography
          preset="caption"
          style={{ color: colors.error, marginTop: spacing[1] }}
        >
          {error}
        </Typography>
      )}

      {/* Android bottom sheet picker */}
      <BottomSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={label ?? 'Select'}
      >
        {options.map((opt, idx) => (
          <React.Fragment key={opt.value}>
            <TouchableOpacity
              onPress={() => {
                onValueChange(opt.value);
                setSheetOpen(false);
              }}
              style={[styles.option, { height: layout.listItemHeight, paddingHorizontal: spacing[4] }]}
            >
              <Typography
                preset="bodyLg"
                style={{ flex: 1, color: colors.textPrimary }}
              >
                {opt.label}
              </Typography>
              {opt.value === value && (
                <Icon name="check" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
            {idx < options.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Select;
