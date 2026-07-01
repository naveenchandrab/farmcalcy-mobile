import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import type { User } from '@app-types';
import { extractErrorMessage } from '@services/ApiErrorMapper';
import { useAuthStore } from '@store/authStore';
import { showError } from '@utils/toast';

import { profileService } from '../services/profile.service';
import type { PickedImage, UpdateProfileRequest } from '../services/profile.service';

export const profileKeys = {
  me: ['profile', 'me'] as const,
};

/** Full current-user record (phone, avatar, member-since, …), not just the auth-store snapshot. */
export const useProfile = (): UseQueryResult<User, Error> =>
  useQuery({
    queryKey: profileKeys.me,
    queryFn: () => profileService.getMe(),
  });

/**
 * Uploads a photo then saves it as the current user's avatarUrl. Refreshes
 * both the profile query and the auth store so the new photo shows up
 * everywhere immediately (drawer, dashboard headers, this screen).
 */
export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (image: PickedImage) => {
      const avatarUrl = await profileService.uploadAvatar(image);
      return profileService.updateProfile({ avatarUrl });
    },
    onSuccess: user => {
      queryClient.setQueryData(profileKeys.me, user);
      useAuthStore.getState().setUser(user);
    },
    onError: (error: unknown) => {
      showError(extractErrorMessage(error));
    },
  });
};

/** Updates name / phone on the current user. */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfileRequest) => profileService.updateProfile(payload),
    onSuccess: user => {
      queryClient.setQueryData(profileKeys.me, user);
      useAuthStore.getState().setUser(user);
    },
    onError: (error: unknown) => {
      showError(extractErrorMessage(error));
    },
  });
};
