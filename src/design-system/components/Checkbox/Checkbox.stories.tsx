import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';

import Checkbox from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Design System/Checkbox',
  component: Checkbox,
  args: {
    value: false,
    disabled: false,
    error: false,
  },
  argTypes: {
    value: { control: 'boolean' },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
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
type Story = StoryObj<typeof Checkbox>;

export const Unchecked: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(false);
    return <Checkbox {...args} value={value} onValueChange={setValue} label="I agree to the terms" />;
  },
};

export const Checked: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(true);
    return <Checkbox {...args} value={value} onValueChange={setValue} label="I agree to the terms" />;
  },
};

export const NoLabel: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(false);
    return <Checkbox {...args} value={value} onValueChange={setValue} />;
  },
};

export const ErrorState: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(false);
    return (
      <Checkbox
        {...args}
        value={value}
        onValueChange={setValue}
        label="Confirm batch details are correct"
        error
      />
    );
  },
};

export const DisabledUnchecked: Story = {
  args: { value: false, disabled: true, label: 'Admin approval required' },
  render: (args) => <Checkbox {...args} onValueChange={() => {}} />,
};

export const DisabledChecked: Story = {
  args: { value: true, disabled: true, label: 'Verified by supervisor' },
  render: (args) => <Checkbox {...args} onValueChange={() => {}} />,
};

export const CheckboxGroup: Story = {
  render: () => {
    const [selected, setSelected] = React.useState<string[]>([]);
    const toggle = (item: string) =>
      setSelected(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);
    const items = ['Broiler', 'Layer', 'Duck', 'Turkey'];
    return (
      <View style={{ padding: 16, gap: 12 }}>
        {items.map(item => (
          <Checkbox
            key={item}
            value={selected.includes(item)}
            onValueChange={() => toggle(item)}
            label={item}
          />
        ))}
      </View>
    );
  },
};
