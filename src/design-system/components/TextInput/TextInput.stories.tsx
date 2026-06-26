import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import React from 'react';
import TextInput from './TextInput';

const meta: Meta<typeof TextInput> = {
  title: 'Design System/TextInput',
  component: TextInput,
  args: {
    label: 'Farm Name',
    placeholder: 'Enter farm name',
    value: '',
  },
  argTypes: {
    errorMessage: { control: 'text' },
    helperText: { control: 'text' },
    leftIcon: { control: 'text' },
    rightIcon: { control: 'text' },
    maxLength: { control: 'number' },
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
type Story = StoryObj<typeof TextInput>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState('');
    return <TextInput {...args} value={value} onChangeText={setValue} />;
  },
};

export const WithLeftIcon: Story = {
  render: (args) => {
    const [value, setValue] = React.useState('');
    return <TextInput {...args} value={value} onChangeText={setValue} leftIcon="barn" label="Farm ID" placeholder="FCM-001" />;
  },
};

export const WithHelperText: Story = {
  render: (args) => {
    const [value, setValue] = React.useState('');
    return (
      <TextInput
        {...args}
        value={value}
        onChangeText={setValue}
        label="Mobile Number"
        leftIcon="phone-outline"
        helperText="We'll send OTP to this number"
        keyboardType="phone-pad"
      />
    );
  },
};

export const ErrorState: Story = {
  render: (args) => {
    const [value, setValue] = React.useState('invalid@');
    return (
      <TextInput
        {...args}
        value={value}
        onChangeText={setValue}
        label="Email"
        leftIcon="email-outline"
        errorMessage="Enter a valid email address"
      />
    );
  },
};

export const WithCharacterCount: Story = {
  render: (args) => {
    const [value, setValue] = React.useState('');
    return (
      <TextInput
        {...args}
        value={value}
        onChangeText={setValue}
        label="Notes"
        placeholder="Add remarks…"
        maxLength={200}
        multiline
      />
    );
  },
};

export const Disabled: Story = {
  args: { value: 'Read-only value', editable: false, label: 'Created By' },
};
