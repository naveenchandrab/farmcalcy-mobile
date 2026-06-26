# PCFMS Mobile App — Implementation Phases

Poultry Contract Farming Management System (FarmCalcy)  
Mobile App: React Native · TypeScript · React Navigation v7 · Zustand · TanStack Query · Custom Design System · Storybook  
Platform: **Android** (active) · **iOS** (upcoming)

---

## Legend


| Symbol | Meaning               |
| ------ | --------------------- |
| ✅      | Completed             |
| 🔄     | In progress           |
| 📋     | Planned               |
| 💡     | Future / nice-to-have |


---

## Platform Compatibility Notes

These apply across all phases. Verify both platforms at each phase boundary.

| Concern | Android | iOS |
| --- | --- | --- |
| Secure token storage | Keychain (react-native-keychain) | Keychain (same lib, uses iOS Keychain Services) |
| Push notification channel | FCM (Google Play Services) | FCM via APNs bridge — requires Apple Developer cert |
| Push permission | Granted by default | Explicit user prompt required (`requestPermission`) |
| Biometrics | Fingerprint / Face Unlock | Touch ID / Face ID — `NSFaceIDUsageDescription` in Info.plist |
| Safe area | Status bar only | Notch + Dynamic Island + home indicator (use `SafeAreaView`) |
| Deep links | App Links (`/.well-known/assetlinks.json`) | Universal Links (`/.well-known/apple-app-site-association`) |
| Background refresh | WorkManager | BGTaskScheduler |
| Build toolchain | Gradle | Xcode + CocoaPods |
| Distribution | Google Play / APK sideload | App Store / TestFlight — Apple review required |

---

## ✅ Phase 1 — Project Foundation & Auth

*Mirrors backend Phase 1*

### Infrastructure

- [x] React Native project scaffold with TypeScript strict mode
- [x] Absolute imports configured (`@features/`, `@components/`, `@services/`, `@design-system`, etc.)
- [x] Environment config (`react-native-config`) — `BASE_URL`, `APP_ENV`
- [x] `react-native-safe-area-context` + `SafeAreaProvider` — handles notch, Dynamic Island, home indicator on iOS
- [x] Axios client with base URL from env
- [x] Request interceptor — attach JWT access token from Keychain
- [x] Response interceptor — detect 401, refresh token, retry original request
- [x] Token refresh race condition guard (isRefreshing flag + refreshQueue drain pattern)
- [x] Global error mapper — `ApiErrorMapper.ts` with 18 error codes + network/timeout fallback
- [x] Toast notification utility — custom imperative API (`showSuccess`, `showError`, `showInfo`, `showWarning`)
- [x] App entry point wiring: `NavigationContainer`, `ThemeProvider`, `QueryClientProvider`, `ToastProvider`
- [x] **Android:** `gradle.properties` heap (4 GB JVM, parallel + caching) + `app/build.gradle` signing config (keystore.properties file, CI env-var fallback, R8 + shrinkResources on release, ProGuard rules) — `android/` directory created
- [x] **iOS:** `ios/Podfile` (platform 15.0, New Arch, all third-party pods) + `ios/FarmCalcy/Info.plist` (all permission strings, background modes, ATS localhost exception) + `ios/FarmCalcy/PrivacyInfo.xcprivacy` (App Store privacy manifest, required since May 2024)

### Design System (`src/design-system/`)

Custom component library built on React Native primitives. **React Native Paper removed** — all UI owned by this design system.

#### Design Tokens (`design-system/tokens/`)

- [x] `colors.ts` — green-primary palette (`primary` `#1B3D1B`), `brand` `#E67E22`, semantic aliases, status badge colour pairs, dark mode overrides
- [x] `typography.ts` — platform-specific font family, size scale (2xs → 5xl), text presets (displayLg → caption)
- [x] `spacing.ts` — 4pt base grid (spacing[0]–spacing[24]), layout aliases (screenPaddingH, buttonHeight, inputHeight, listItemHeight)
- [x] `radius.ts` — `none`, `sm`, `md`, `lg`, `xl`, `full`
- [x] `shadows.ts` — xs/sm/md/lg with Android `elevation` + iOS shadow props
- [x] `zIndex.ts` — layering scale (base, dropdown, modal, toast)

#### Theme (`design-system/theme/`)

- [x] `ThemeProvider` — React context exposing light / dark token sets; reads from `ThemeStore`
- [x] `useTheme()` hook — typed access to current theme (`Theme` type derived from `lightTokens`)
- [x] `ThemeStore` (Zustand + persist) — mode: `light | dark | system`, `getActiveTheme()`, `toggleTheme()`, `setTheme()`
- [x] Dark theme token overrides — full set of dark surfaces, text, border, status colours

#### Core Components (`design-system/components/`)

- [x] `Button` — variants: `primary`, `secondary`, `outlined`, `ghost`, `danger`; loading state; disabled; `fullWidth`
- [x] `IconButton` — circular pressable with icon, size and variant props
- [x] `TextInput` — label, helper text, error state, left/right icon adornment, character count
- [x] `PasswordInput` — `TextInput` wrapper with show/hide toggle
- [x] `OtpInput` — 6-cell auto-advance with paste support
- [x] `Typography` — presets: `displayLg/Md`, `headingLg/Md/Sm`, `bodyLg/Md/Sm`, `labelLg/Md/Sm`, `caption`
- [x] `Card` — surface container with shadow and padding props
- [x] `Badge` — status pill with colour map; custom colour override
- [x] `Chip` — variants: `filled`, `outlined`, `soft`; selected state; left icon; removable
- [x] `Avatar` — initials fallback + image support, size variants
- [x] `Divider` — horizontal, with optional label
- [x] `EmptyState` — icon circle + title + description + optional CTA button
- [x] `LoadingSpinner` — full-screen and inline variants
- [x] `Skeleton` — animated shimmer; `ListItemSkeleton` and `CardSkeleton` pre-composed
- [x] `Toast` — imperative API (`showSuccess/Error/Info/Warning`), slide-in animation, auto-dismiss, `ToastProvider` + `ToastBridge`
- [x] `Modal` — accessible overlay, backdrop dismiss, keyboard avoidance
- [x] `BottomSheet` — PanResponder drag-to-dismiss (>30% height or velocity >0.5), spring open
- [x] `ConfirmDialog` — title, body, confirm + cancel; destructive variant
- [x] `SearchBar` — clear button, shadow, themed background
- [x] `ListItem` — left icon slot (circle bg), title, subtitle, chevron, divider, destructive variant
- [x] `StatusBar` — sets correct `barStyle` for light/dark on both platforms
- [x] `SafeAreaView` wrapper — consistent inset handling via `react-native-safe-area-context`

#### Form Primitives

- [x] `Select` — iOS: `ActionSheetIOS`; Android: custom `BottomSheet` picker; generic typed `SelectOption<T>`
- [x] `DatePicker` — cross-platform wrapper over `@react-native-community/datetimepicker`
- [x] `Checkbox` — animated check, label prop, error state
- [x] `RadioButton` / `RadioGroup` — single-select group with label
- [x] `Switch` — animated spring thumb, themed track colour

### Storybook (`@storybook/react-native` v8)

- [x] `@storybook/react-native` v8 + addons (`ondevice-controls`, `ondevice-actions`, `ondevice-backgrounds`, `ondevice-notes`) in `devDependencies`
- [x] **Entry point** — `.storybook/index.ts` exports `StorybookUI`; `index.js` conditionally loads it when `STORYBOOK=true`
- [x] **Metro plugin** — `metro.config.js` wrapped with `withStorybook` (only activates when `STORYBOOK=true`, zero overhead in production)
- [x] **Config** — `.storybook/main.ts` (stories glob `../src/**/*.stories.?(ts|tsx)`) + `.storybook/preview.tsx` (global decorator: `SafeAreaProvider → ThemeProvider → ToastProvider → ToastBridge`)
- [x] **Scripts** — `npm run storybook` / `storybook:android` / `storybook:ios`
- [x] **27 story files** — one collocated `ComponentName.stories.tsx` per DS component directory
  - Primitives: Typography (AllPresets), Button (6 variants + icons + FullWidth), TextInput (error, icons, char count), PasswordInput, OtpInput
  - Display: Card (elevation × padding), Badge (all 8 statuses), Avatar (all 5 sizes), Divider (horizontal/vertical), Chip (FilterRow + WithRemove interactive demos), Skeleton (ListItemSkeleton + CardSkeleton)
  - Form: Switch (SettingsList), Checkbox (CheckboxGroup), RadioGroup (vertical/horizontal), Select (generic typed), DatePicker (date/time/datetime modes), SearchBar
  - Utility: ListItem (FullMenuList demo), IconButton (all sizes + variants), EmptyState (NoBatches/NoResults/NoUsers variants), LoadingSpinner (inline + overlay)
  - Overlays: Modal (dismissible/non-dismissible), BottomSheet (50%/70% snap), ConfirmDialog (destructive + loading), Toast (trigger buttons for all 4 types), AppStatusBar, AppSafeAreaView

### Auth Feature (`features/auth`)

- [x] **Splash Screen** — calls `authStore.initialize()`; conditional stack auto-transitions
- [x] **Login Screen** — React Hook Form + Zod; email or 10-digit mobile validation
- [x] Login API call (`POST /auth/login`) via TanStack Query mutation (`useLogin`)
- [x] Store access + refresh tokens in Keychain (`com.farmcalcy.pcfms` service name)
- [x] `AuthStore` (Zustand): `user`, `isAuthenticated`, `isInitializing`, `login()`, `logout()`, `initialize()`
- [x] **Logout** — `onSettled` pattern (clears local state even on API failure); `queryClient.clear()` before logout
- [x] Session restore on app launch — `Promise.all([Keychain, AsyncStorage])` in `initialize()`
- [x] Role-based navigation — conditional stack rendering (no `useEffect` navigate)
- [x] Keyboard-avoiding scroll view on Login Screen (`KeyboardAvoidingWrapper`)

### User Management Feature (`features/users`) — SAAS_ADMIN only

- [x] **User List Screen** — debounced search (300ms), role + status filter chips, FlatList
- [x] **User Details Screen** — role badge, status badge, status toggle with confirmation
- [x] **Create User Screen** — name, email, phone, role selector (`Select` DS component)
- [x] **Edit User Screen** — pre-populated via cached TanStack Query data
- [x] `useUsers` hook — `userKeys` factory, list + single + mutations
- [x] `users.service.ts` — typed API calls against `/users` endpoints
- [x] Optimistic status toggle with `cancelQueries` + `setQueryData` + rollback on error

### Navigation

- [x] Root stack: `Splash` → `AuthStack` or `AppStack` (conditional on `isInitializing` / `isAuthenticated`)
- [x] Auth stack: `Login`, `ForgotPassword` (placeholder), `OtpVerification` (placeholder), `ResetPassword` (placeholder), `ForceChangePassword` (placeholder)
- [x] App stack: `SaasAdminNavigator` wired; `AppNavigator` routes to role-specific stacks
- [x] Protected routing — unauthenticated users see Auth stack automatically (no imperative redirect)

### ✅ Phase 1 Complete

All Phase 1 items are done. Phase 2 is next.

---

## 📋 Phase 2 — SaaS Administration

*Mirrors backend Phase 2*

### Company Management Feature (`features/companies`) — SAAS_ADMIN only

- [ ] **Company List Screen** — paginated list, status filter, search
- [ ] **Company Details Screen** — full detail view with subscription status badge
- [ ] **Create Company Screen** — company info + admin details in single form
- [ ] **Edit Company Screen** — update company details
- [ ] **Company Status Screen** — activate / deactivate toggle with confirmation modal
- [ ] **Subscription Screen** — update subscription tier and expiry
- [ ] **SAAS Dashboard Screen** — summary cards: total companies, active, trial, expired
- [ ] `useCompanies` hook + `companies.service.ts`
- [ ] Subscription status colour coding: `TRIAL` (amber), `ACTIVE` (green), `EXPIRED` (red), `SUSPENDED` (grey)

### Navigation

- [ ] App stack extended: Companies tab for SAAS_ADMIN
- [ ] Company nested stack: List → Details → Edit / Status / Subscription

---

## 📋 Phase 3 — Company Provisioning & Auth Flows

*Mirrors backend Phase 3*

### Extended Auth Flows

- [ ] **Forgot Password Screen** — email input, triggers OTP send
- [ ] **OTP Verification Screen** — 6-digit OTP input with countdown timer and resend
- [ ] **Reset Password Screen** — new password + confirm, Zod min-strength validation
- [ ] **Change Password Screen** — current password + new password (authenticated)
- [ ] Force change password flow — intercept login response, redirect if `mustChangePassword=true`
- [ ] OTP service: `otp.service.ts` wrapping `/otp/send` and `/otp/verify`

### Tenant User Management (`features/tenant/users`) — TENANT_ADMIN only

- [ ] **Tenant User List Screen** — role/status filters, search
- [ ] **Tenant User Details Screen**
- [ ] **Create Tenant User Screen** — role selector (SUPERVISOR / FARMER)
- [ ] **Edit Tenant User Screen**
- [ ] **User Status Toggle** — activate / deactivate with confirmation
- [ ] **Delete User** — soft-delete with confirmation dialog
- [ ] `useTenantUsers` hook + `tenant-users.service.ts`

### Farm Management (`features/farms`) — TENANT_ADMIN only

- [ ] **Farm List Screen** — status filter, search, farmer count badge
- [ ] **Farm Details Screen** — details + farmer count + status
- [ ] **Create Farm Screen** — name, location, capacity fields
- [ ] **Edit Farm Screen**
- [ ] **Farm Status Toggle** — ACTIVE / INACTIVE
- [ ] `useFarms` hook + `farms.service.ts`

### Farmer Management (`features/farmers`) — TENANT_ADMIN only

- [ ] **Farmer List Screen** — farm filter, status filter, search
- [ ] **Farmer Details Screen** — masked Aadhaar display (`XXXX-XXXX-NNNN`)
- [ ] **Create Farmer Screen** — farm selector (ACTIVE farms only), Aadhaar input
- [ ] **Edit Farmer Screen** — farm reassignment support
- [ ] **Farmer Status Toggle**
- [ ] `useFarmers` hook + `farmers.service.ts`

### Supervisor Management (`features/supervisors`) — TENANT_ADMIN only

- [ ] **Supervisor List Screen** — status filter, sortable by employee code / joining date
- [ ] **Supervisor Details Screen**
- [ ] **Create Supervisor Screen** — employee code, joining date picker
- [ ] **Edit Supervisor Screen** — code is read-only after creation
- [ ] **Supervisor Status Screen** — ACTIVE / INACTIVE / RESIGNED
- [ ] `useSupervisors` hook + `supervisors.service.ts`

### Navigation

- [ ] App stack extended: Tenant admin drawer/tabs (Users, Farms, Farmers, Supervisors)
- [ ] Forgot password / OTP / reset password screens added to Auth stack

---

## 📋 Phase 4 — Batch & Flock Management

*Mirrors backend Phase 4*

### Batch Management Feature (`features/batches`)

- [ ] **Batch List Screen** — status badges (`ACTIVE`, `CLOSED`, `CANCELLED`), farm filter
- [ ] **Batch Details Screen** — bird count, placement date, supervisor assigned, status
- [ ] **Create Batch Screen** — farm selector, supervisor selector, placement date picker, bird type/count
- [ ] **Edit Batch Screen** — supervisor reassignment
- [ ] **Close Batch Screen** — final weight, FCR, mortality summary entry
- [ ] **Batch Status Screen** — cancel batch with confirmation
- [ ] `useBatches` hook + `batches.service.ts`

### Placement Records

- [ ] **Placement Record Form** — chick count, supplier, price per chick, date picker
- [ ] Placement record displayed within Batch Details
- [ ] `usePlacementRecords` hook

### Navigation

- [ ] Batches tab added to TENANT_ADMIN / SUPERVISOR navigation
- [ ] Batch nested stack: List → Details → Create / Edit / Close

---

## 📋 Phase 5 — Feed Management

*Mirrors backend Phase 5*

### Feed Management Feature (`features/feed`)

- [ ] **Feed Records List Screen** — per-batch feed timeline, date-sorted
- [ ] **Add Feed Record Screen** — feed type selector, quantity (kg), cost, date picker
- [ ] **Edit Feed Record Screen**
- [ ] **Delete Feed Record** — with confirmation
- [ ] Cumulative FCR card displayed on Batch Details screen
- [ ] `useFeedRecords` hook + `feed.service.ts`
- [ ] Feed type selector populated from `FeedType` enum / reference table

---

## 📋 Phase 6 — Mortality & Medicine Records

*Mirrors backend Phase 6*

### Mortality Feature (`features/mortality`)

- [ ] **Mortality Records List Screen** — per-batch, date-sorted, running total
- [ ] **Add Mortality Record Screen** — date, count, reason input
- [ ] **Edit / Delete Mortality Record**
- [ ] Mortality rate badge on Batch Details screen
- [ ] `useMortalityRecords` hook + `mortality.service.ts`

### Medicine Feature (`features/medicines`)

- [ ] **Medicine Records List Screen** — per-batch timeline
- [ ] **Add Medicine Record Screen** — name, dosage, cost, administered-by, date
- [ ] **Edit / Delete Medicine Record**
- [ ] `useMedicineRecords` hook + `medicines.service.ts`

---

## 📋 Phase 7 — Contract Management

*Mirrors backend Phase 7*

### Contract Feature (`features/contracts`)

- [ ] **Contract List Screen** — status badges (`DRAFT`, `ACTIVE`, `COMPLETED`, `TERMINATED`)
- [ ] **Contract Details Screen** — terms, target FCR, target weight, payment structure
- [ ] **Create Contract Screen** — farm/supervisor selectors, date range pickers, terms entry
- [ ] **Edit Contract Screen** — editable only in DRAFT status
- [ ] **Contract Lifecycle Actions** — draft → active → completed; terminate with reason
- [ ] **Linked Batches** — list of batches associated with contract on Details screen
- [ ] Contract document viewer (PDF preview via device viewer)
- [ ] `useContracts` hook + `contracts.service.ts`

### Navigation

- [ ] Contracts tab added to TENANT_ADMIN navigation

---

## 📋 Phase 8 — Production & Weight Tracking

*Mirrors backend Phase 8*

### Weight Tracking Feature (`features/weight`)

- [ ] **Weight Records List Screen** — per-batch weekly chart view + table
- [ ] **Add Weight Record Screen** — sample count, average weight (grams), date
- [ ] **Edit / Delete Weight Record**
- [ ] Target weight deviation indicator (green / amber / red)
- [ ] `useWeightRecords` hook + `weight.service.ts`

### Harvest Records

- [ ] **Harvest Record Form** — final weight, total birds harvested, price per kg
- [ ] Harvest summary card on Batch Details / Close Batch screen

---

## 📋 Phase 9 — Financial Management

*Mirrors backend Phase 9*

### Invoice Feature (`features/invoices`)

- [ ] **Invoice List Screen** — per-company, with outstanding balance indicator
- [ ] **Invoice Details Screen** — line items: chick cost, feed, medicine, labour
- [ ] **Payment Record Form** — amount, date, reference number
- [ ] Outstanding balance calculation displayed on Invoice Details
- [ ] Basic P&L summary card per batch
- [ ] `useInvoices` hook + `invoices.service.ts`

---

## 📋 Phase 10 — Reporting & Analytics

*Mirrors backend Phase 10*

### Reports Feature (`features/reports`)

- [ ] **Batch Performance Report Screen** — FCR, mortality rate, weight gain chart
- [ ] **Farm Performance Summary Screen** — aggregated across batches
- [ ] **Company KPI Dashboard Screen** — TENANT_ADMIN overview cards
- [ ] **SAAS Analytics Screen** — SAAS_ADMIN cross-tenant metrics
- [ ] Date-range picker filter on all report screens
- [ ] **Export** — trigger CSV / Excel download and share via native share sheet
- [ ] `useReports` hook + `reports.service.ts`

---

## 📋 Phase 11 — Notifications

*Mirrors backend Phase 11*

### Notifications Feature (`features/notifications`)

- [ ] **Notification List Screen** — unread / all tabs, pull-to-refresh
- [ ] **Notification Detail Screen** — deep-link to relevant entity (batch, contract, etc.)
- [ ] Mark as read (single + mark-all-as-read)
- [ ] FCM push notification setup (`@react-native-firebase/messaging`)
- [ ] **Android:** FCM token registration; no explicit permission prompt needed
- [ ] **iOS:** `requestPermission()` call — must show rationale before prompting; APNs certificate uploaded to Firebase Console; `NSUserNotificationsUsageDescription` in Info.plist
- [ ] Foreground push handler — show in-app banner (both platforms)
- [ ] Background / quit-state push handler — navigate to relevant screen on tap
- [ ] **iOS:** `getAPNSToken()` must resolve before FCM token is available — handle async ordering
- [ ] Notification badge count on tab/drawer icon (**iOS:** set `applicationIconBadgeNumber` via Firebase; **Android:** handled automatically by notification channel)
- [ ] Notification preferences screen (per-category toggles)
- [ ] `useNotifications` hook + `notifications.service.ts`

---

## 📋 Phase 12 — Advanced Auth & Security

*Mirrors backend Phase 12*

### Advanced Auth Screens

- [ ] **Active Sessions Screen** — list of logged-in devices + selective revoke
- [ ] **Login History Screen** — recent logins with device/location info
- [ ] **TOTP Setup Screen** — QR code scan + 6-digit verification to enable 2FA
- [ ] **TOTP Verify Screen** — second-factor prompt on login when 2FA enabled
- [ ] **Password Policy Screen** — display expiry warning; force change when expired
- [ ] Biometric unlock for app re-entry (`react-native-biometrics` or `expo-local-authentication`)
  - **Android:** Fingerprint / Face Unlock (BiometricPrompt API)
  - **iOS:** Touch ID / Face ID — requires `NSFaceIDUsageDescription` string in Info.plist; omitting it causes a crash on Face ID devices
- [ ] Graceful fallback to PIN/password when biometrics not enrolled or hardware absent

---

## 📋 Phase 13 — External Integrations

*Mirrors backend Phase 13*

### Integrations Feature (`features/integrations`) — TENANT_ADMIN only

- [ ] **Webhook Management Screen** — list, create, edit, delete webhook subscriptions
- [ ] **API Keys Screen** — create / revoke external API keys
- [ ] Webhook delivery log viewer (last N delivery attempts + status)
- [ ] Integration status indicators (connected / disconnected) for linked services

---

## 💡 Future Considerations


| Topic                 | Notes                                                                                                          |
| --------------------- | -------------------------------------------------------------------------------------------------------------- |
| Offline mode          | Queue mutations locally (MMKV + background sync) for poor-connectivity areas                                   |
| FARM_OWNER role       | Read-only farm performance dashboard scoped to owned farms                                                     |
| Veterinarian role     | Medical record entry and prescription tracking screens                                                         |
| Accountant role       | Invoice approval and payment marking screens                                                                   |
| Barcode / QR scanner  | Scan batch / farm codes during field operations (`NSCameraUsageDescription` required on iOS)                   |
| Camera integration    | Attach photos to mortality / weight / harvest records (`NSCameraUsageDescription` + `NSPhotoLibraryUsageDescription` on iOS) |
| Multi-language (i18n) | `i18n-js` or `react-i18next` — Hindi, Telugu, Tamil priority                                                   |
| Tablet layout         | Two-pane master-detail for iPad / Android tablet; iPad requires separate provisioning profile                  |
| Deep links            | Android App Links + iOS Universal Links — both need server-hosted JSON verification files                      |
| iOS App Store         | TestFlight beta → App Store submission; Apple review ~1–3 days; privacy manifest required (iOS 17.4+)         |
| Google Play           | Internal testing → production track; target API level must stay current each year                              |
| OTA updates           | CodePush / EAS Update for JS-only hotfixes without going through store review (both platforms)                 |


---

## Screen Map (Phase 1–3)

### Auth Stack


| Screen                | Route                 | Roles      |
| --------------------- | --------------------- | ---------- |
| Splash                | `Splash`              | All        |
| Login                 | `Login`               | All        |
| Forgot Password       | `ForgotPassword`      | All        |
| OTP Verification      | `OtpVerification`     | All        |
| Reset Password        | `ResetPassword`       | All        |
| Change Password       | `ChangePassword`      | All (auth) |
| Force Change Password | `ForceChangePassword` | All (auth) |


### SAAS_ADMIN Stack


| Screen          | Route            |
| --------------- | ---------------- |
| SAAS Dashboard  | `SaasDashboard`  |
| Company List    | `CompanyList`    |
| Company Details | `CompanyDetails` |
| Create Company  | `CreateCompany`  |
| Edit Company    | `EditCompany`    |
| User List       | `UserList`       |
| User Details    | `UserDetails`    |
| Create User     | `CreateUser`     |
| Edit User       | `EditUser`       |


### TENANT_ADMIN Stack


| Screen              | Route               |
| ------------------- | ------------------- |
| Tenant Dashboard    | `TenantDashboard`   |
| Tenant User List    | `TenantUserList`    |
| Tenant User Details | `TenantUserDetails` |
| Create Tenant User  | `CreateTenantUser`  |
| Farm List           | `FarmList`          |
| Farm Details        | `FarmDetails`       |
| Create Farm         | `CreateFarm`        |
| Farmer List         | `FarmerList`        |
| Farmer Details      | `FarmerDetails`     |
| Create Farmer       | `CreateFarmer`      |
| Supervisor List     | `SupervisorList`    |
| Supervisor Details  | `SupervisorDetails` |
| Create Supervisor   | `CreateSupervisor`  |


---

*Last updated: 2026-06-26 — Phase 1 native build config complete; only Storybook remains*