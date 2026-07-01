import { apiClient } from '@api/axios';
import type { ApiResponse } from '@app-types';

import type {
  RegisterTenantApiRequest,
  RegisterStaffApiRequest,
  RegisterFarmOwnerApiRequest,
  RegistrationResponse,
  RegistrationStatusResponse,
  CompanyCodeValidation,
  PaginatedRegistrations,
} from '../types';

/**
 * Registration approval-workflow API calls.
 *
 * The public submission + validation endpoints are unauthenticated (listed in
 * AUTH_SKIP_ENDPOINTS). The reviewer endpoints (list / approve / reject) require
 * a SAAS_ADMIN or TENANT_ADMIN bearer token.
 */
export const registrationService = {
  // ─── Public ──────────────────────────────────────────────────────────────────

  async registerTenant(payload: RegisterTenantApiRequest): Promise<RegistrationResponse> {
    const { data } = await apiClient.post<ApiResponse<RegistrationResponse>>(
      '/registrations/tenant',
      payload,
    );
    return data.data;
  },

  async registerSupervisor(payload: RegisterStaffApiRequest): Promise<RegistrationResponse> {
    const { data } = await apiClient.post<ApiResponse<RegistrationResponse>>(
      '/registrations/supervisor',
      payload,
    );
    return data.data;
  },

  async registerFarmOwner(payload: RegisterFarmOwnerApiRequest): Promise<RegistrationResponse> {
    const { data } = await apiClient.post<ApiResponse<RegistrationResponse>>(
      '/registrations/farm-owner',
      payload,
    );
    return data.data;
  },

  async validateCompanyCode(companyCode: string): Promise<CompanyCodeValidation> {
    const { data } = await apiClient.get<ApiResponse<CompanyCodeValidation>>(
      '/registrations/validate-company-code',
      { params: { companyCode } },
    );
    return data.data;
  },

  async getStatus(id: string): Promise<RegistrationStatusResponse> {
    const { data } = await apiClient.get<ApiResponse<RegistrationStatusResponse>>(
      `/registrations/status/${id}`,
    );
    return data.data;
  },

  /** Tracks the latest registration by email OR phone (auto-detected server-side). */
  async track(identifier: string): Promise<RegistrationStatusResponse> {
    const { data } = await apiClient.post<ApiResponse<RegistrationStatusResponse>>(
      '/registrations/track',
      { identifier: identifier.trim() },
    );
    return data.data;
  },

  // ─── Reviewer ──────────────────────────────────────────────────────────────────

  async list(params: {
    page?: number;
    limit?: number;
    status?: string;
    requestType?: string;
    search?: string;
  }): Promise<PaginatedRegistrations> {
    const { data } = await apiClient.get<ApiResponse<PaginatedRegistrations>>('/registrations', {
      params,
    });
    return data.data;
  },

  async getById(id: string): Promise<RegistrationResponse> {
    const { data } = await apiClient.get<ApiResponse<RegistrationResponse>>(`/registrations/${id}`);
    return data.data;
  },

  async approve(id: string): Promise<RegistrationResponse> {
    const { data } = await apiClient.post<ApiResponse<RegistrationResponse>>(
      `/registrations/${id}/approve`,
      {},
    );
    return data.data;
  },

  async reject(id: string, reason?: string): Promise<RegistrationResponse> {
    const { data } = await apiClient.post<ApiResponse<RegistrationResponse>>(
      `/registrations/${id}/reject`,
      reason ? { reason } : {},
    );
    return data.data;
  },
};
