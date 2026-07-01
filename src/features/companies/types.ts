export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED';
export type SubscriptionStatusFilter = 'ALL' | SubscriptionStatus;

export interface CompanyDto {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string | null;
  addressLine1: string | null;
  district: string | null;
  state: string | null;
  subscriptionStatus: SubscriptionStatus;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  isActive: boolean;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedCompaniesDto {
  items: CompanyDto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CompanyListParams {
  search?: string;
  isActive?: boolean;
  subscriptionStatus?: SubscriptionStatus;
  page?: number;
  limit?: number;
}
