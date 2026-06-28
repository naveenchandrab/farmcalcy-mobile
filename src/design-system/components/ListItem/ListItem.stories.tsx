import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';

import ListItem from './ListItem';

const meta: Meta<typeof ListItem> = {
  title: 'Design System/ListItem',
  component: ListItem,
  args: {
    title: 'Farm Profile',
    showChevron: true,
    showDivider: true,
    disabled: false,
    destructive: false,
  },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    showChevron: { control: 'boolean' },
    showDivider: { control: 'boolean' },
    disabled: { control: 'boolean' },
    destructive: { control: 'boolean' },
    left: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <View style={{ backgroundColor: '#FFFFFF' }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ListItem>;

export const Default: Story = {
  args: { title: 'Farm Profile', left: 'barn', onPress: () => {} },
};

export const WithSubtitle: Story = {
  args: {
    title: 'Naveen C B',
    subtitle: 'SAAS Admin · naveenchandrab23@gmail.com',
    left: 'account-circle-outline',
    onPress: () => {},
  },
};

export const NoChevron: Story = {
  args: { title: 'App Version', subtitle: 'v1.0.0', left: 'information-outline', showChevron: false },
};

export const Destructive: Story = {
  args: { title: 'Logout', left: 'logout', destructive: true, onPress: () => {} },
};

export const Disabled: Story = {
  args: { title: 'Support (coming soon)', left: 'headset', disabled: true },
};

export const FullMenuList: Story = {
  render: () => (
    <View style={{ backgroundColor: '#FFFFFF' }}>
      <ListItem title="Farm Profile" left="barn" onPress={() => {}} />
      <ListItem title="Manage Users" left="account-group-outline" subtitle="3 active users" onPress={() => {}} />
      <ListItem title="Notifications" left="bell-outline" onPress={() => {}} />
      <ListItem title="App Settings" left="cog-outline" onPress={() => {}} />
      <ListItem title="Help & Support" left="help-circle-outline" onPress={() => {}} />
      <ListItem title="Logout" left="logout" destructive onPress={() => {}} showDivider={false} />
    </View>
  ),
};
