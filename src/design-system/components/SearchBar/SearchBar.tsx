import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme';
import { radius } from '../../tokens/radius';
import { shadows } from '../../tokens/shadows';
import TextInput from '../TextInput/TextInput';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search…',
}) => {
  const { colors, spacing } = useTheme();

  return (
    <View style={[styles.wrapper, { paddingHorizontal: spacing[4], paddingVertical: spacing[2] }]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        leftIcon="magnify"
        rightIcon={value ? 'close-circle' : undefined}
        onRightIconPress={value ? () => onChangeText('') : undefined}
        returnKeyType="search"
        autoCorrect={false}
        containerStyle={[
          styles.bar,
          shadows.xs,
          { backgroundColor: colors.surface, borderRadius: radius.lg },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {},
  bar: {},
});

export default SearchBar;
