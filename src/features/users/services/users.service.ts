import { apiClient } from '@api/axios';
import type { ApiResponse, PaginatedResponse, User } from '@app-types';

import { mapApiUserList, mapApiUserToUser } from '../types';
import type {
  ApiUserDto,
  CreateUserRequest,
  ToggleUserStatusRequest,
  UpdateUserRequest,
  UserListFilters,
} from '../types';

/**
 * All SAAS_ADMIN user management API calls.
 * Endpoints map to the NestJS /users resource.
 */
export const usersService = {
  /**
   * Fetches a paginated, filtered list of users.
   * Query params: page, limit, search, role, status
   */
  async getUsers(
    filters: Partial<UserListFilters>,
  ): Promise<ApiResponse<PaginatedResponse<User>>> {
    const params: Record<string, string | number> = {
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
    };
    if (filters.search) {
      params.search = filters.search;
    }
    if (filters.role && filters.role !== 'ALL') {
      params.role = filters.role;
    }
    if (filters.status && filters.status !== 'ALL') {
      params.status = filters.status;
    }

    const { data } = await apiClient.get<
      ApiResponse<{ items?: ApiUserDto[]; meta?: PaginatedResponse<User>['meta'] }>
    >('/users', { params });
    return {
      ...data,
      data: mapApiUserList(data.data, Number(params.page), Number(params.limit)),
    };
  },

  /** Fetches a single user by ID. */
  async getUserById(userId: string): Promise<ApiResponse<User>> {
    const { data } = await apiClient.get<ApiResponse<ApiUserDto>>(`/users/${userId}`);
    return { ...data, data: mapApiUserToUser(data.data) };
  },

  /** Creates a new system user. */
  async createUser(payload: CreateUserRequest): Promise<ApiResponse<User>> {
    const { data } = await apiClient.post<ApiResponse<ApiUserDto>>('/users', payload);
    return { ...data, data: mapApiUserToUser(data.data) };
  },

  /** Partially updates a user's profile. */
  async updateUser(userId: string, payload: UpdateUserRequest): Promise<ApiResponse<User>> {
    const { data } = await apiClient.patch<ApiResponse<ApiUserDto>>(
      `/users/${userId}`,
      payload,
    );
    return { ...data, data: mapApiUserToUser(data.data) };
  },

  /**
   * Activates or deactivates a user.
   * Used for the status toggle with optimistic update.
   */
  async toggleStatus(
    userId: string,
    payload: ToggleUserStatusRequest,
  ): Promise<ApiResponse<User>> {
    const { data } = await apiClient.patch<ApiResponse<ApiUserDto>>(
      `/users/${userId}/status`,
      payload,
    );
    return { ...data, data: mapApiUserToUser(data.data) };
  },
};
