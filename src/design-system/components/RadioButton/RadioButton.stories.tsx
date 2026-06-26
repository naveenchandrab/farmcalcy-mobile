import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import React from 'react';
import RadioGroup from './RadioButton';

type Role = 'TENANT_ADMIN' | 'SUPERVISOR' | 'FARMER';

const ROLE_OPTIONS: { label: string; value: Role }[] = [
  { label: 'Tenant Admin', value: 'TENANT_ADMIN' },
  { label: 'Supervisor', value: 'SUPERVISOR' },
  { label: 'Farmer', value: 'FARMER' },
];

const meta: Meta<typeof RadioGroup> = {
  title: 'Design System/RadioGroup',
  component: RadioGroup,
  args: {
    disabled: false,
    horizontal: false,
  },
  argTypes: {
    disabled: { control: 'boolean' },
    horizontal: { control: 'boolean' },
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
type Story = StoryObj<typeof RadioGroup>;

export const Vertical: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<Role>('FARMER');
    return (
      <RadioGroup
        {...args}
        options={ROLE_OPTIONS}
        value={value}
        onValueChange={setValue}
      />
    );
  },
};

export const Horizontal: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<Role>('SUPERVISOR');
    return (
      <RadioGroup
        {...args}
        options={ROLE_OPTIONS}
        value={value}
        onValueChange={setValue}
        horizontal
      />
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup
      options={ROLE_OPTIONS}
      value="TENANT_ADMIN"
      onValueChange={() => {}}
      disabled
    />
  ),
};

export const TwoOptions: Story = {
  render: () => {
    const [value, setValue] = React.useState<'yes' | 'no'>('yes');
    return (
      <RadioGroup
        options={[
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' },
        ]}
        value={value}
        onValueChange={setValue}
        horizontal
      />
    );
  },
};
