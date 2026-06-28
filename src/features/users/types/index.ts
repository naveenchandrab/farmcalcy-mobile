import { z } from 'zod';

import type { PaginatedResponse, User, UserRole, UserStatus } from '@app-types';

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

// ─── API Response Mapping ───────────────────────────────────────────────────
//
// The NestJS /users resource serialises a user as `{ ...profile, isActive }` —
// it has NO `status` enum and (in the list DTO) NO `role`/`roleName` field, and
// the list payload is `{ items }` without a pagination `meta`. The app-wide
// `User` type instead expects `role` + `status` enums, so every read path is
// normalised through `mapApiUserToUser` before it reaches the UI. Without this
// the User screens crash on `status.toUpperCase()` (status is undefined).

const KNOWN_ROLES: readonly UserRole[] = [
  'SAAS_ADMIN',
  'TENANT_ADMIN',
  'SUPERVISOR',
  'FARMER',
];

const KNOWN_STATUSES: readonly UserStatus[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

/** The user shape as the backend actually serialises it (tolerant of both contracts). */
export interface ApiUserDto {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  /** Boolean activation flag from the current backend contract. */
  isActive?: boolean;
  /** Explicit status enum, if a future backend version provides it. */
  status?: string | null;
  /** Role may arrive as a flat name or a nested relation, depending on endpoint. */
  roleName?: string | null;
  role?: string | { name?: string | null } | null;
  companyId?: string | null;
  mustChangePassword?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const resolveRole = (dto: ApiUserDto): UserRole => {
  const raw =
    dto.roleName ?? (typeof dto.role === 'string' ? dto.role : dto.role?.name) ?? '';
  return (KNOWN_ROLES as readonly string[]).includes(raw)
    ? (raw as UserRole)
    : 'FARMER';
};

const resolveStatus = (dto: ApiUserDto): UserStatus => {
  if (dto.status && (KNOWN_STATUSES as readonly string[]).includes(dto.status)) {
    return dto.status as UserStatus;
  }
  // Fall back to the boolean activation flag the backend currently returns.
  return dto.isActive === false ? 'INACTIVE' : 'ACTIVE';
};

/** Normalises a backend user payload into the app-wide `User` type. */
export const mapApiUserToUser = (dto: ApiUserDto): User => {
  const nowIso = new Date().toISOString();
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    phone: dto.phone ?? undefined,
    role: resolveRole(dto),
    status: resolveStatus(dto),
    companyId: dto.companyId ?? undefined,
    mustChangePassword: dto.mustChangePassword ?? false,
    createdAt: dto.createdAt ?? nowIso,
    updatedAt: dto.updatedAt ?? nowIso,
  };
};

/** Normalises a paginated user list, synthesising `meta` when the backend omits it. */
export const mapApiUserList = (
  raw: { items?: ApiUserDto[]; meta?: PaginatedResponse<User>['meta'] } | undefined,
  page: number,
  limit: number,
): PaginatedResponse<User> => {
  const items = (raw?.items ?? []).map(mapApiUserToUser);
  const total = raw?.meta?.total ?? items.length;
  return {
    items,
    meta: raw?.meta ?? {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / Math.max(1, limit))),
      hasNextPage: false,
      hasPreviousPage: page > 1,
    },
  };
};

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
