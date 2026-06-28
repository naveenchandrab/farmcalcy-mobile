import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';

import PasswordInput from './PasswordInput';

const meta: Meta<typeof PasswordInput> = {
  title: 'Design System/PasswordInput',
  component: PasswordInput,
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    value: '',
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PasswordInput>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState('');
    return <PasswordInput {...args} value={value} onChangeText={setValue} />;
  },
};

export const WithValue: Story = {
  render: (args) => {
    const [value, setValue] = React.useState('MySecret@123');
    return <PasswordInput {...args} value={value} onChangeText={setValue} />;
  },
};

export const ErrorState: Story = {
  render: (args) => {
    const [value, setValue] = React.useState('short');
    return (
      <PasswordInput
        {...args}
        value={value}
        onChangeText={setValue}
        errorMessage="Password must be at least 8 characters"
      />
    );
  },
};

export const ConfirmPassword: Story = {
  render: (args) => {
    const [value, setValue] = React.useState('');
    return (
      <PasswordInput
        {...args}
        label="Confirm Password"
        placeholder="Re-enter your password"
        value={value}
        onChangeText={setValue}
      />
    );
  },
};
