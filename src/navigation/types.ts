import type { NavigatorScreenParams } from '@react-navigation/native';

// ─── Auth Stack ───────────────────────────────────────────────────────────────

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OtpVerification: { email: string };
  ResetPassword: { token: string };
  ForceChangePassword: undefined;
};

// ─── SAAS Admin Stack ─────────────────────────────────────────────────────────

export type SaasAdminStackParamList = {
  SaasDashboard: undefined;
  UserList: undefined;
  UserDetails: { userId: string };
  CreateUser: undefined;
  EditUser: { userId: string };
  CompanyList: undefined;
  CompanyDetails: { companyId: string };
  CreateCompany: undefined;
  EditCompany: { companyId: string };
  CompanyStatus: { companyId: string };
  Subscription: { companyId: string };
};

// ─── Tenant Admin Stack ───────────────────────────────────────────────────────

export type TenantAdminStackParamList = {
  TenantDashboard: undefined;
  TenantUserList: undefined;
  TenantUserDetails: { userId: string };
  CreateTenantUser: undefined;
  EditTenantUser: { userId: string };
  FarmList: undefined;
  FarmDetails: { farmId: string };
  CreateFarm: undefined;
  EditFarm: { farmId: string };
  FarmerList: undefined;
  FarmerDetails: { farmerId: string };
  CreateFarmer: undefined;
  EditFarmer: { farmerId: string };
  SupervisorList: undefined;
  SupervisorDetails: { supervisorId: string };
  CreateSupervisor: undefined;
  EditSupervisor: { supervisorId: string };
  ChangePassword: undefined;
};

// ─── Supervisor Stack ─────────────────────────────────────────────────────────

export type SupervisorStackParamList = {
  SupervisorDashboard: undefined;
  ChangePassword: undefined;
};

// ─── Root ─────────────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  SaasAdmin: NavigatorScreenParams<SaasAdminStackParamList>;
  TenantAdmin: NavigatorScreenParams<TenantAdminStackParamList>;
  Supervisor: NavigatorScreenParams<SupervisorStackParamList>;
};

// ─── Typed navigation helpers ─────────────────────────────────────────────────
//
// Use these in screens instead of the raw useNavigation / useRoute hooks
// so parameters are type-checked at compile time.
//
// Example:
//   const navigation = useTypedNavigation<'TenantAdmin'>();

import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

export type SaasAdminScreenProps<T extends keyof SaasAdminStackParamList> =
  NativeStackScreenProps<SaasAdminStackParamList, T>;

export type TenantAdminScreenProps<T extends keyof TenantAdminStackParamList> =
  NativeStackScreenProps<TenantAdminStackParamList, T>;
