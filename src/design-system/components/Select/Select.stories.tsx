import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';

import Select from './Select';
import type { SelectOption } from './Select';

type BirdType = 'broiler' | 'layer' | 'duck' | 'turkey';

const BIRD_OPTIONS: SelectOption<BirdType>[] = [
  { label: 'Broiler', value: 'broiler' },
  { label: 'Layer', value: 'layer' },
  { label: 'Duck', value: 'duck' },
  { label: 'Turkey', value: 'turkey' },
];

const meta: Meta<typeof Select> = {
  title: 'Design System/Select',
  component: Select,
  args: {
    label: 'Bird Type',
    placeholder: 'Select bird type',
    disabled: false,
  },
  argTypes: {
    disabled: { control: 'boolean' },
    error: { control: 'text' },
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
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<BirdType | null>(null);
    return (
      <Select<BirdType>
        {...args}
        options={BIRD_OPTIONS}
        value={value}
        onValueChange={setValue}
      />
    );
  },
};

export const WithValue: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<BirdType | null>('broiler');
    return (
      <Select<BirdType>
        {...args}
        options={BIRD_OPTIONS}
        value={value}
        onValueChange={setValue}
      />
    );
  },
};

export const ErrorState: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<BirdType | null>(null);
    return (
      <Select<BirdType>
        {...args}
        options={BIRD_OPTIONS}
        value={value}
        onValueChange={setValue}
        error="Please select a bird type"
      />
    );
  },
};

export const Disabled: Story = {
  render: (args) => (
    <Select<BirdType>
      {...args}
      options={BIRD_OPTIONS}
      value="broiler"
      onValueChange={() => {}}
      disabled
    />
  ),
};

export const ManyOptions: Story = {
  render: (args) => {
    type Month = string;
    const months: SelectOption<Month>[] = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ].map(m => ({ label: m, value: m.toLowerCase() }));
    const [value, setValue] = React.useState<Month | null>(null);
    return (
      <Select<Month>
        {...args}
        label="Month"
        placeholder="Select month"
        options={months}
        value={value}
        onValueChange={setValue}
      />
    );
  },
};
