import { apiClient } from '@api/axios';
import type { ApiResponse, PaginatedResponse, User } from '@app-types';

import type {
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

    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<User>>>('/users', {
      params,
    });
    return data;
  },

  /** Fetches a single user by ID. */
  async getUserById(userId: string): Promise<ApiResponse<User>> {
    const { data } = await apiClient.get<ApiResponse<User>>(`/users/${userId}`);
    return data;
  },

  /** Creates a new system user. */
  async createUser(payload: CreateUserRequest): Promise<ApiResponse<User>> {
    const { data } = await apiClient.post<ApiResponse<User>>('/users', payload);
    return data;
  },

  /** Partially updates a user's profile. */
  async updateUser(userId: string, payload: UpdateUserRequest): Promise<ApiResponse<User>> {
    const { data } = await apiClient.patch<ApiResponse<User>>(`/users/${userId}`, payload);
    return data;
  },

  /**
   * Activates or deactivates a user.
   * Used for the status toggle with optimistic update.
   */
  async toggleStatus(
    userId: string,
    payload: ToggleUserStatusRequest,
  ): Promise<ApiResponse<User>> {
    const { data } = await apiClient.patch<ApiResponse<User>>(
      `/users/${userId}/status`,
      payload,
    );
    return data;
  },
};
