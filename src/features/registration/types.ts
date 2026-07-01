/**
 * Registration approval workflow — API request/response shapes (mirrors the
 * backend `registrations` module). No password is collected anywhere; a
 * temporary one is generated on approval.
 */
import type {
  RegisterTenantFormValues,
  RegisterStaffFormValues,
  RegisterFarmOwnerFormValues,
} from '@features/auth/types';

export type RegistrationType = 'TENANT' | 'SUPERVISOR' | 'FARM_OWNER';
export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// ─── Request payloads (exact backend DTO shapes) ───────────────────────────────

/** Structured Indian address shared by every registration type. */
export interface StructuredAddress {
  addressLine1: string;
  addressLine2?: string;
  taluk?: string;
  village?: string;
  landmark?: string;
  district: string;
  state: string;
  pincode: string;
}

export interface RegisterTenantApiRequest extends StructuredAddress {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  gstNumber?: string;
  firstName: string;
  lastName: string;
  adminEmail: string;
  phoneNumber: string;
  aadhaarFrontUrl?: string;
  aadhaarBackUrl?: string;
}

export interface RegisterStaffApiRequest extends StructuredAddress {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  companyCode: string;
}

export interface RegisterFarmOwnerApiRequest extends RegisterStaffApiRequest {
  gpsLatitude?: number;
  gpsLongitude?: number;
}

// ─── Response payloads ─────────────────────────────────────────────────────────

export interface RegistrationResponse {
  id: string;
  requestType: RegistrationType;
  status: RegistrationStatus;
  companyName: string | null;
  companyCode: string | null;
  companyEmail: string | null;
  companyPhone: string | null;
  companyAddress: string | null;
  gpsLatitude: number | null;
  gpsLongitude: number | null;
  gstNumber: string | null;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string | null;
  requestedRole: string;
  tenantId: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectedBy: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  createdUserId: string | null;
  createdCompanyId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyCodeValidation {
  valid: boolean;
  companyName: string | null;
  companyCode: string | null;
}

export interface RegistrationStatusResponse {
  id: string;
  requestType: RegistrationType;
  status: RegistrationStatus;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedRegistrations {
  items: RegistrationResponse[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── Form → API mappers ────────────────────────────────────────────────────────

/** Extracts the structured-address fields (already trimmed by the zod schema). */
const toAddress = (v: StructuredAddress): StructuredAddress => ({
  addressLine1: v.addressLine1,
  addressLine2: v.addressLine2,
  taluk: v.taluk,
  village: v.village,
  landmark: v.landmark,
  district: v.district,
  state: v.state,
  pincode: v.pincode,
});

export const toTenantRequest = (v: RegisterTenantFormValues): RegisterTenantApiRequest => ({
  companyName: v.companyName,
  companyEmail: v.companyEmail,
  companyPhone: v.companyPhone,
  ...toAddress(v),
  gstNumber: v.gstNumber,
  firstName: v.firstName,
  lastName: v.lastName,
  adminEmail: v.adminEmail,
  phoneNumber: v.phoneNumber,
  aadhaarFrontUrl: v.aadhaarFrontUrl,
  aadhaarBackUrl: v.aadhaarBackUrl,
});

export const toStaffRequest = (v: RegisterStaffFormValues): RegisterStaffApiRequest => ({
  firstName: v.firstName,
  lastName: v.lastName,
  phoneNumber: v.phoneNumber,
  email: v.email,
  companyCode: v.companyCode,
  ...toAddress(v),
});

export const toFarmOwnerRequest = (
  v: RegisterFarmOwnerFormValues,
): RegisterFarmOwnerApiRequest => ({
  ...toStaffRequest(v),
  gpsLatitude: v.gpsLatitude,
  gpsLongitude: v.gpsLongitude,
});

/** Human-readable label for a registration type. */
export const REGISTRATION_TYPE_LABEL: Record<RegistrationType, string> = {
  TENANT: 'Company',
  SUPERVISOR: 'Supervisor',
  FARM_OWNER: 'Farm Owner',
};
