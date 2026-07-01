import { apiClient } from '@api/axios';
import type { ApiResponse } from '@app-types';

import type { CompanyDto, CompanyListParams, PaginatedCompaniesDto } from '../types';

export const companiesService = {
  async list(params: CompanyListParams): Promise<PaginatedCompaniesDto> {
    const queryParams: Record<string, string | number | boolean> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.search) {
      queryParams.search = params.search;
    }
    if (params.isActive !== undefined) {
      queryParams.isActive = params.isActive;
    }
    if (params.subscriptionStatus) {
      queryParams.subscriptionStatus = params.subscriptionStatus;
    }

    const { data } = await apiClient.get<ApiResponse<PaginatedCompaniesDto>>('/companies', {
      params: queryParams,
    });
    return data.data;
  },

  async getById(id: string): Promise<CompanyDto> {
    const { data } = await apiClient.get<ApiResponse<CompanyDto>>(`/companies/${id}`);
    return data.data;
  },
};
