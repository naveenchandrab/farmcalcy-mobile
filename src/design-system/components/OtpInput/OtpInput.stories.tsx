import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import React from 'react';
import OtpInput from './OtpInput';

const meta: Meta<typeof OtpInput> = {
  title: 'Design System/OtpInput',
  component: OtpInput,
  args: {
    length: 6,
    autoFocus: false,
  },
  argTypes: {
    length: { control: 'number' },
    autoFocus: { control: 'boolean' },
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
type Story = StoryObj<typeof OtpInput>;

export const Empty: Story = {
  render: (args) => {
    const [value, setValue] = React.useState('');
    return <OtpInput {...args} value={value} onChange={setValue} />;
  },
};

export const PartiallyFilled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState('123');
    return <OtpInput {...args} value={value} onChange={setValue} />;
  },
};

export const Complete: Story = {
  render: (args) => {
    const [value, setValue] = React.useState('482916');
    return <OtpInput {...args} value={value} onChange={setValue} />;
  },
};

export const WithError: Story = {
  render: (args) => {
    const [value, setValue] = React.useState('000000');
    return (
      <OtpInput
        {...args}
        value={value}
        onChange={setValue}
        errorMessage="Invalid OTP. Please try again."
      />
    );
  },
};

export const FourDigit: Story = {
  render: (args) => {
    const [value, setValue] = React.useState('');
    return <OtpInput {...args} length={4} value={value} onChange={setValue} />;
  },
};
