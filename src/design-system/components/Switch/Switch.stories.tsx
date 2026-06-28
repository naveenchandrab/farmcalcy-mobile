import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';

import Switch from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Design System/Switch',
  component: Switch,
  args: {
    value: false,
    disabled: false,
  },
  argTypes: {
    value: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
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
type Story = StoryObj<typeof Switch>;

export const Off: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(false);
    return <Switch {...args} value={value} onValueChange={setValue} label="Enable notifications" />;
  },
};

export const On: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(true);
    return <Switch {...args} value={value} onValueChange={setValue} label="Enable notifications" />;
  },
};

export const NoLabel: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(false);
    return <Switch {...args} value={value} onValueChange={setValue} />;
  },
};

export const DisabledOff: Story = {
  args: { value: false, disabled: true, label: 'Premium feature (locked)' },
  render: (args) => <Switch {...args} onValueChange={() => {}} />,
};

export const DisabledOn: Story = {
  args: { value: true, disabled: true, label: 'System setting (managed)' },
  render: (args) => <Switch {...args} onValueChange={() => {}} />,
};

export const SettingsList: Story = {
  render: () => {
    const [push, setPush] = React.useState(true);
    const [email, setEmail] = React.useState(false);
    const [sms, setSms] = React.useState(true);
    return (
      <View style={{ padding: 16, gap: 20 }}>
        <Switch value={push} onValueChange={setPush} label="Push notifications" />
        <Switch value={email} onValueChange={setEmail} label="Email alerts" />
        <Switch value={sms} onValueChange={setSms} label="SMS alerts" />
      </View>
    );
  },
};
