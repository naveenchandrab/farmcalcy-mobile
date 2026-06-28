import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';

import DatePicker from './DatePicker';

const meta: Meta<typeof DatePicker> = {
  title: 'Design System/DatePicker',
  component: DatePicker,
  args: {
    label: 'Placement Date',
    placeholder: 'Select date',
    mode: 'date',
    disabled: false,
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['date', 'time', 'datetime'],
    },
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
type Story = StoryObj<typeof DatePicker>;

export const DateMode: Story = {
  render: (args) => {
    const [date, setDate] = React.useState<Date | null>(null);
    return <DatePicker {...args} value={date} onChange={setDate} mode="date" label="Placement Date" />;
  },
};

export const WithValue: Story = {
  render: (args) => {
    const [date, setDate] = React.useState<Date | null>(new Date('2026-06-10'));
    return <DatePicker {...args} value={date} onChange={setDate} mode="date" label="Placement Date" />;
  },
};

export const TimeMode: Story = {
  render: (args) => {
    const [date, setDate] = React.useState<Date | null>(null);
    return <DatePicker {...args} value={date} onChange={setDate} mode="time" label="Feeding Time" />;
  },
};

export const DateTimeMode: Story = {
  render: (args) => {
    const [date, setDate] = React.useState<Date | null>(null);
    return <DatePicker {...args} value={date} onChange={setDate} mode="datetime" label="Harvest Scheduled At" />;
  },
};

export const ErrorState: Story = {
  render: (args) => {
    const [date, setDate] = React.useState<Date | null>(null);
    return (
      <DatePicker
        {...args}
        value={date}
        onChange={setDate}
        label="Contract End Date"
        error="End date must be after start date"
      />
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <DatePicker
      value={new Date('2026-06-26')}
      onChange={() => {}}
      label="Created At"
      disabled
    />
  ),
};
