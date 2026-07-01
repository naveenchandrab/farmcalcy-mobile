import { apiClient } from '@api/axios';
import type { ApiResponse } from '@app-types';

import type { AppNotification, PaginatedNotifications, UnreadCount } from '../types';

/** In-app notification API calls (all require an authenticated session). */
export const notificationService = {
  async list(params: { page?: number; unreadOnly?: boolean }): Promise<PaginatedNotifications> {
    const { data } = await apiClient.get<ApiResponse<PaginatedNotifications>>('/notifications', {
      params,
    });
    return data.data;
  },

  async unreadCount(): Promise<UnreadCount> {
    const { data } = await apiClient.get<ApiResponse<UnreadCount>>('/notifications/unread-count');
    return data.data;
  },

  async markRead(id: string): Promise<AppNotification> {
    const { data } = await apiClient.patch<ApiResponse<AppNotification>>(
      `/notifications/${id}/read`,
    );
    return data.data;
  },

  async markAllRead(): Promise<{ updated: number }> {
    const { data } = await apiClient.post<ApiResponse<{ updated: number }>>(
      '/notifications/read-all',
      {},
    );
    return data.data;
  },
};
