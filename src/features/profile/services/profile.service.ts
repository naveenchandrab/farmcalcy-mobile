import { apiClient } from '@api/axios';
import type { ApiResponse, User } from '@app-types';
import { mapApiUserToUser } from '@features/users/types';
import type { ApiUserDto } from '@features/users/types';

export interface PickedImage {
  uri: string;
  type?: string;
  fileName?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  avatarUrl?: string;
}

/**
 * Self-service "my profile" API calls — distinct from `features/users`, which
 * manages *other* users and is role-scoped (SAAS_ADMIN / TENANT_ADMIN only).
 * These hit /auth/me and /uploads/avatar, which work for every role.
 */
export const profileService = {
  /** Fetches the full current-user record (phone, avatar, member-since, …). */
  async getMe(): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<ApiUserDto>>('/auth/me');
    return mapApiUserToUser(data.data);
  },

  /** Updates name / phone / avatarUrl on the current user. */
  async updateProfile(payload: UpdateProfileRequest): Promise<User> {
    const { data } = await apiClient.patch<ApiResponse<ApiUserDto>>('/auth/me', payload);
    return mapApiUserToUser(data.data);
  },

  /** Uploads a profile photo and returns the URL to save via `updateProfile`. */
  async uploadAvatar(image: PickedImage): Promise<string> {
    const form = new FormData();
    // React Native's FormData accepts this { uri, type, name } shape for file uploads.
    form.append('file', {
      uri: image.uri,
      type: image.type ?? 'image/jpeg',
      name: image.fileName ?? `avatar-${Date.now()}.jpg`,
    });

    const { data } = await apiClient.post<ApiResponse<{ fileRef: string }>>(
      '/uploads/avatar',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data.data.fileRef;
  },
};
