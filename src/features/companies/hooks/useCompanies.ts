import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { companiesService } from '../services/companies.service';
import type { CompanyDto, CompanyListParams, PaginatedCompaniesDto } from '../types';

export const companyKeys = {
  all: ['companies'] as const,
  list: (params: CompanyListParams) => ['companies', 'list', params] as const,
  detail: (id: string) => ['companies', 'detail', id] as const,
};

export const useCompanyList = (
  params: CompanyListParams,
): UseQueryResult<PaginatedCompaniesDto, Error> =>
  useQuery<PaginatedCompaniesDto, Error>({
    queryKey: companyKeys.list(params),
    queryFn: () => companiesService.list(params),
  });

export const useCompanyDetail = (id: string): UseQueryResult<CompanyDto, Error> =>
  useQuery<CompanyDto, Error>({
    queryKey: companyKeys.detail(id),
    queryFn: () => companiesService.getById(id),
    enabled: !!id,
  });
