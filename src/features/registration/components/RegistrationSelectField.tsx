import React, { useState } from 'react';
import { Controller } from 'react-hook-form';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  AUTH_COLORS,
  AUTH_FONT,
  AUTH_SPACING,
  AUTH_TYPE,
} from '@features/auth/components/authTokens';

interface RegistrationSelectFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  placeholder: string;
  leftIcon: string;
  options: readonly string[];
  error?: string;
}

/**
 * Auth-styled single-select field: renders like AuthInput (icon + value/placeholder
 * + chevron) and opens a modal list. Wired to react-hook-form so it drops into the
 * registration forms next to the text fields.
 */
function RegistrationSelectField<T extends FieldValues>({
  control,
  name,
  placeholder,
  leftIcon,
  options,
  error,
}: RegistrationSelectFieldProps<T>): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const hasError = Boolean(error);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => {
        const selected = typeof value === 'string' && value.length > 0 ? value : undefined;
        return (
          <View>
            <TouchableOpacity
              testID={`registration-select-${name}`}
              activeOpacity={0.8}
              onPress={() => setOpen(true)}
              style={[
                styles.field,
                { borderColor: hasError ? AUTH_COLORS.error : AUTH_COLORS.inputBorder },
              ]}
            >
              <Icon
                name={leftIcon}
                size={22}
                color={AUTH_COLORS.placeholder}
                style={styles.leftIcon}
              />
              <Text style={[styles.value, !selected && styles.placeholder]} numberOfLines={1}>
                {selected ?? placeholder}
              </Text>
              <Icon name="chevron-down" size={22} color={AUTH_COLORS.placeholder} />
            </TouchableOpacity>
            {hasError && <Text style={styles.error}>{error}</Text>}

            <Modal
              visible={open}
              transparent
              animationType="slide"
              onRequestClose={() => setOpen(false)}
            >
              <TouchableOpacity
                style={styles.backdrop}
                activeOpacity={1}
                onPress={() => setOpen(false)}
              >
                <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
                  <View style={styles.sheetHandle} />
                  <Text style={styles.sheetTitle}>{placeholder}</Text>
                  <FlatList
                    data={options}
                    keyExtractor={item => item}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.option}
                        onPress={() => {
                          onChange(item);
                          setOpen(false);
                        }}
                      >
                        <Text
                          style={[styles.optionText, item === selected && styles.optionSelected]}
                        >
                          {item}
                        </Text>
                        {item === selected && (
                          <Icon name="check" size={20} color={AUTH_COLORS.primary} />
                        )}
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </TouchableOpacity>
            </Modal>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: AUTH_SPACING.inputHeight,
    borderWidth: 1,
    borderRadius: AUTH_SPACING.inputRadius,
    paddingHorizontal: AUTH_SPACING.inputPaddingHorizontal,
    backgroundColor: AUTH_COLORS.surface,
  },
  leftIcon: { marginRight: 12 },
  value: {
    flex: 1,
    fontSize: AUTH_TYPE.input,
    fontFamily: AUTH_FONT.regular,
    color: AUTH_COLORS.textPrimary,
  },
  placeholder: { color: AUTH_COLORS.placeholder },
  error: {
    marginTop: 6,
    marginLeft: 4,
    fontSize: 13,
    fontFamily: AUTH_FONT.regular,
    color: AUTH_COLORS.error,
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: AUTH_COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    maxHeight: '70%',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: AUTH_COLORS.inputBorder,
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 16,
    fontFamily: AUTH_FONT.semibold,
    color: AUTH_COLORS.textPrimary,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EEEEEE',
  },
  optionText: { fontSize: 15, fontFamily: AUTH_FONT.regular, color: AUTH_COLORS.textPrimary },
  optionSelected: { fontFamily: AUTH_FONT.semibold, color: AUTH_COLORS.primary },
});

export default RegistrationSelectField;
