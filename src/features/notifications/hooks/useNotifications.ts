import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { extractErrorMessage } from '@services/ApiErrorMapper';
import { showError } from '@utils/toast';

import { notificationService } from '../services/notification.service';
import type { AppNotification, PaginatedNotifications, UnreadCount } from '../types';

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
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      const previousListData = queryClient.getQueriesData<PaginatedNotifications>({
        queryKey: ['notifications', 'list'],
      });
      const previousUnread = queryClient.getQueryData<UnreadCount>(notificationKeys.unread);

      // Optimistically mark the notification as read in every cached list
      previousListData.forEach(([key, cached]) => {
        if (!cached) {
          return;
        }
        const target = cached.items.find((n: AppNotification) => n.id === id);
        if (!target || target.read) {
          return;
        }
        queryClient.setQueryData<PaginatedNotifications>(key, {
          ...cached,
          items: cached.items.map((n: AppNotification) =>
            n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n,
          ),
          unreadCount: Math.max(0, cached.unreadCount - 1),
        });
      });

      if (previousUnread) {
        queryClient.setQueryData<UnreadCount>(notificationKeys.unread, {
          unreadCount: Math.max(0, previousUnread.unreadCount - 1),
        });
      }

      return { previousListData, previousUnread };
    },
    onError: (error, _id, context) => {
      context?.previousListData.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      if (context?.previousUnread !== undefined) {
        queryClient.setQueryData(notificationKeys.unread, context.previousUnread);
      }
      showError(extractErrorMessage(error));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      const previousListData = queryClient.getQueriesData<PaginatedNotifications>({
        queryKey: ['notifications', 'list'],
      });
      const previousUnread = queryClient.getQueryData<UnreadCount>(notificationKeys.unread);

      // Optimistically mark every cached notification as read
      previousListData.forEach(([key, cached]) => {
        if (!cached) {
          return;
        }
        queryClient.setQueryData<PaginatedNotifications>(key, {
          ...cached,
          items: cached.items.map((n: AppNotification) => ({
            ...n,
            read: true,
            readAt: n.readAt ?? new Date().toISOString(),
          })),
          unreadCount: 0,
        });
      });

      queryClient.setQueryData<UnreadCount>(notificationKeys.unread, { unreadCount: 0 });

      return { previousListData, previousUnread };
    },
    onError: (error, _v, context) => {
      context?.previousListData.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      if (context?.previousUnread !== undefined) {
        queryClient.setQueryData(notificationKeys.unread, context.previousUnread);
      }
      showError(extractErrorMessage(error));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};
