/**
 * Standard API response envelope matching the NestJS backend contract.
 * Every backend response wraps data in this shape.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errorCode?: string;
  errors?: ApiFieldError[];
  meta?: PaginationMeta;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * All error codes the backend can return.
 * Extend this union as new modules are added.
 */
export type ApiErrorCode =
  | 'INVALID_EMAIL'
  | 'INVALID_PASSWORD'
  | 'USER_NOT_FOUND'
  | 'USER_ALREADY_EXISTS'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'TOKEN_MISSING'
  | 'REFRESH_TOKEN_EXPIRED'
  | 'REFRESH_TOKEN_INVALID'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_FAILED'
  | 'COMPANY_NOT_FOUND'
  | 'COMPANY_SUSPENDED'
  | 'SUBSCRIPTION_EXPIRED'
  | 'INVALID_OTP'
  | 'OTP_EXPIRED'
  | 'MUST_CHANGE_PASSWORD'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'SERVER_ERROR'
  | 'UNKNOWN';

export interface ApiError {
  errorCode: ApiErrorCode;
  message: string;
  statusCode: number;
  errors?: ApiFieldError[];
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
