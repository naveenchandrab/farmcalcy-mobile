import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import React from 'react';
import SearchBar from './SearchBar';

const meta: Meta<typeof SearchBar> = {
  title: 'Design System/SearchBar',
  component: SearchBar,
  args: {
    placeholder: 'Search farms…',
    value: '',
  },
  argTypes: {
    placeholder: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <View style={{ backgroundColor: '#F7F9F7' }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SearchBar>;

export const Empty: Story = {
  render: (args) => {
    const [value, setValue] = React.useState('');
    return <SearchBar {...args} value={value} onChangeText={setValue} />;
  },
};

export const WithValue: Story = {
  render: (args) => {
    const [value, setValue] = React.useState('Ramesh');
    return <SearchBar {...args} value={value} onChangeText={setValue} />;
  },
};

export const FarmSearch: Story = {
  render: () => {
    const [value, setValue] = React.useState('');
    return (
      <SearchBar
        value={value}
        onChangeText={setValue}
        placeholder="Search farms, batches…"
      />
    );
  },
};
