import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import React from 'react';
import Chip from './Chip';

const meta: Meta<typeof Chip> = {
  title: 'Design System/Chip',
  component: Chip,
  args: {
    label: 'Broiler',
    selected: false,
    variant: 'soft',
    disabled: false,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'outlined', 'soft'],
    },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    leftIcon: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Default: Story = {};
export const Selected: Story = { args: { selected: true } };
export const FilledSelected: Story = { args: { variant: 'filled', selected: true } };
export const FilledUnselected: Story = { args: { variant: 'filled', selected: false } };
export const Outlined: Story = { args: { variant: 'outlined' } };
export const OutlinedSelected: Story = { args: { variant: 'outlined', selected: true } };
export const WithIcon: Story = { args: { leftIcon: 'check-circle', label: 'Active', selected: true } };
export const Disabled: Story = { args: { disabled: true, label: 'Unavailable' } };

export const FilterRow: Story = {
  render: () => {
    const [selected, setSelected] = React.useState('all');
    const filters = ['all', 'active', 'trial', 'suspended'];
    return (
      <View style={{ padding: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {filters.map(f => (
          <Chip
            key={f}
            label={f.charAt(0).toUpperCase() + f.slice(1)}
            selected={selected === f}
            variant="soft"
            onPress={() => setSelected(f)}
          />
        ))}
      </View>
    );
  },
};

export const WithRemove: Story = {
  render: () => {
    const [tags, setTags] = React.useState(['Broiler', 'Layer', 'Duck']);
    return (
      <View style={{ padding: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {tags.map(tag => (
          <Chip
            key={tag}
            label={tag}
            selected
            variant="filled"
            onRemove={() => setTags(prev => prev.filter(t => t !== tag))}
          />
        ))}
      </View>
    );
  },
};
