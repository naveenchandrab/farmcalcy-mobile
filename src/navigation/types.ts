import type { NavigatorScreenParams } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

// ─── Auth Stack ───────────────────────────────────────────────────────────────

export type AuthStackParamList = {
  Login: undefined;
  /** Registration type selector (company / supervisor / farm owner). */
  Register: undefined;
  RegisterTenant: undefined;
  RegisterSupervisor: undefined;
  RegisterFarmOwner: undefined;
  /** Terminal "pending approval" screen shown after a successful submission. */
  RegistrationPending: {
    registrationId: string;
    requestType: 'TENANT' | 'SUPERVISOR' | 'FARM_OWNER';
    email?: string | null;
  };
  /** Self-service status check by email/phone (reachable from Login). */
  TrackRegistration: undefined;
  ForgotPassword: undefined;
  /** Carries the email the OTP was sent to. */
  OtpVerification: { email: string };
  /**
   * Carries the email + the OTP entered on the verification screen.
   * The backend verifies-and-consumes the OTP at reset time, so it is passed
   * through rather than verified separately.
   */
  ResetPassword: { email: string; otp: string };
  /**
   * Forced first-login password change. Reached after a login whose user has
   * mustChangePassword = true; the temporary session tokens live in the auth store.
   */
  ForceChangePassword: { email: string };
};

// ─── Registration Review Stack (shared by reviewer roles) ─────────────────────

export type RegistrationsStackParamList = {
  RegistrationApprovalList: undefined;
  RegistrationApprovalDetail: { id: string };
};

export type RegistrationsScreenProps<T extends keyof RegistrationsStackParamList> =
  NativeStackScreenProps<RegistrationsStackParamList, T>;

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

// ─── SAAS Admin: Drawer (hamburger) → Bottom Tabs ─────────────────────────────
//
// SAAS_ADMIN navigation is a Drawer whose single screen hosts a reusable
// bottom-tab navigator. The hamburger opens the Drawer; the tab bar switches
// the main sections. The Users tab nests the existing SaasAdmin stack.

export type SaasTabParamList = {
  DashboardTab: undefined;
  TenantsTab: undefined;
  UsersTab: NavigatorScreenParams<SaasAdminStackParamList> | undefined;
  ReportsTab: undefined;
  MoreTab: undefined;
};

export type SaasDrawerParamList = {
  Home: NavigatorScreenParams<SaasTabParamList> | undefined;
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

export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

export type SaasAdminScreenProps<T extends keyof SaasAdminStackParamList> = NativeStackScreenProps<
  SaasAdminStackParamList,
  T
>;

export type TenantAdminScreenProps<T extends keyof TenantAdminStackParamList> =
  NativeStackScreenProps<TenantAdminStackParamList, T>;
