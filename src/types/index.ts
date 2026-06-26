export type {
  ApiResponse,
  ApiFieldError,
  PaginationMeta,
  PaginatedResponse,
  ApiErrorCode,
  ApiError,
  RefreshTokenResponse,
} from './api';

// ─── User & Auth ────────────────────────────────────────────────────────────

export type UserRole = 'SAAS_ADMIN' | 'TENANT_ADMIN' | 'SUPERVISOR' | 'FARMER';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  companyId?: string;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ─── Company ─────────────────────────────────────────────────────────────────

export type SubscriptionTier = 'TRIAL' | 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';
export type CompanyStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'EXPIRED';

export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  status: CompanyStatus;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiresAt: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Common ──────────────────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark' | 'system';

export type ActiveTheme = 'light' | 'dark';
