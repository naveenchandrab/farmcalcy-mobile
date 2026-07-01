import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { extractErrorMessage } from '@services/ApiErrorMapper';
import { showError } from '@utils/toast';

import { notificationService } from '../services/notification.service';
import type { PaginatedNotifications, UnreadCount } from '../types';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (unreadOnly: boolean) => ['notifications', 'list', { unreadOnly }] as const,
  unread: ['notifications', 'unread-count'] as const,
};

/** Paginated notifications list. */
export const useNotifications = (
  unreadOnly: boolean,
): UseQueryResult<PaginatedNotifications, Error> =>
  useQuery<PaginatedNotifications, Error>({
    queryKey: notificationKeys.list(unreadOnly),
    queryFn: () => notificationService.list({ unreadOnly }),
  });

/** Unread count — polled lightly so the header bell badge stays fresh. */
export const useUnreadCount = (): UseQueryResult<UnreadCount, Error> =>
  useQuery<UnreadCount, Error>({
    queryKey: notificationKeys.unread,
    queryFn: () => notificationService.unreadCount(),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: error => showError(extractErrorMessage(error)),
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: error => showError(extractErrorMessage(error)),
  });
};
