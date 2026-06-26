import React, { forwardRef, useState } from 'react';
import type { TextInput as RNTextInput } from 'react-native';

import TextInput from '../TextInput/TextInput';
import type { TextInputProps } from '../TextInput/TextInput';

type PasswordInputProps = Omit<TextInputProps, 'secureTextEntry' | 'rightIcon' | 'onRightIconPress'>;

/**
 * PasswordInput — TextInput with integrated show/hide toggle.
 * The eye icon toggles between secureTextEntry states.
 */
const PasswordInput = forwardRef<RNTextInput, PasswordInputProps>((props, ref) => {
  const [visible, setVisible] = useState(false);

  return (
    <TextInput
      ref={ref}
      secureTextEntry={!visible}
      rightIcon={visible ? 'eye-off-outline' : 'eye-outline'}
      onRightIconPress={() => setVisible(v => !v)}
      {...props}
    />
  );
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
