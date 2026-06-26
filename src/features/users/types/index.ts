import { z } from 'zod';

import type { UserRole, UserStatus } from '@app-types';

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be under 100 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number')
    .optional()
    .or(z.literal('')),
  role: z.enum(['SAAS_ADMIN', 'TENANT_ADMIN', 'SUPERVISOR', 'FARMER'] as const, {
    required_error: 'Role is required',
  }),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});

export const editUserSchema = createUserSchema
  .omit({ password: true })
  .extend({
    password: z
      .string()
      .optional()
      .refine(
        val => !val || val.length >= 8,
        'Password must be at least 8 characters',
      ),
  });

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type EditUserFormValues = z.infer<typeof editUserSchema>;

// ─── API Request Types ────────────────────────────────────────────────────────

export interface CreateUserRequest {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  password?: string;
}

export interface ToggleUserStatusRequest {
  status: UserStatus;
}

// ─── Filter Types ─────────────────────────────────────────────────────────────

export type UserRoleFilter = UserRole | 'ALL';
export type UserStatusFilter = UserStatus | 'ALL';

export interface UserListFilters {
  search: string;
  role: UserRoleFilter;
  status: UserStatusFilter;
  page: number;
  limit: number;
}
