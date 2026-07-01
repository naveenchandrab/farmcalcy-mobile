# FarmsEasy Mobile — Android QA & Bug-Fix Report

**Scope:** Full validation of the Android app run as a real user — build, emulator
boot, install, launch, and end-to-end automation of every implemented auth flow,
fixing the application (not the tests) wherever a flow failed.

**Environment used**

| Tool | Version / detail |
|---|---|
| Device | Pixel 9 AVD, **Android 15 (API 35)**, arm64 |
| Node / npm | 22.14 / 10.9 |
| JDK | **Temurin/OpenJDK 17** (installed for the build; system default was JDK 23, which Gradle 8.10 rejects) |
| Gradle / AGP | 8.10.2 / RN 0.76.5 defaults, compileSdk 35 |
| Backend | `farmseasy-api` (NestJS + Prisma + Postgres 15), Mailpit for OTP email capture |
| Automation | Maestro (e2e), Jest + RNTL (unit/integration) |

**Result:** App builds, installs, launches, and **all 11 runnable auth e2e flows pass**;
**225 unit/integration tests pass** at **93% statement / 95% line coverage**.

---

## Summary of bugs found & fixed

| # | Severity | Area | Symptom | Root cause | Fix |
|---|---|---|---|---|---|
| 1 | **High (crash)** | Users feature | SAAS_ADMIN screen threw `TypeError: Cannot read property 'toUpperCase' of undefined` after login | Backend `/users` returns `isActive:boolean` with **no `status`/`role`** and no pagination `meta`; the app's `User` type expects `status`/`role`. `StatusBadge` called `status.toUpperCase()` on `undefined` | Added `mapApiUserToUser` / `mapApiUserList` to normalise the real backend shape (`isActive→status`, role passthrough, synthesised `meta`); hardened `StatusBadge` to never crash on missing data |
| 2 | **High** | API client | Wrong-credentials login showed a generic *"Something went wrong"* instead of *"email or password is incorrect"* | The response interceptor treated **every** 401 as an expired session — including 401s from `/auth/login`. It attempted a token refresh, failed (no refresh token), and rejected with that error, **discarding the original 401** | Interceptor now skips the refresh path for `AUTH_SKIP_ENDPOINTS` (login/forgot/reset/otp); their 401s propagate untouched so the screen maps the correct message |
| 3 | **High (UX)** | Keyboard handling | On the Reset/Login screens the text field and submit button were **hidden behind the soft keyboard**, with no way to scroll to them | Android 15 enforces **edge-to-edge**, so `adjustResize` no longer shrinks the window; `KeyboardAvoidingView` had `behavior=undefined` on Android and did nothing | Set `behavior="height"` on Android + auto-`scrollToEnd` on keyboard show in both `AuthScreenLayout` and `LoginScreen`; removed a `flex:1` spacer that pinned content to the viewport |
| 4 | **Medium (UX)** | OTP flow | A **wrong OTP still advanced to the password-reset screen**; the user only learned it was invalid after filling in a new password | The OTP screen carried the code forward and let `/auth/reset-password` reject it at the end | OTP is now validated up-front via `/otp/verify`; invalid → inline error, stays on screen; valid → advances. Required a backend change so `/otp/verify` **validates without consuming** (reset/change still consume) |
| 5 | **Medium** | Users header | Logout control unreachable; header drawn under the status bar | Logged-in SAAS_ADMIN had **no logout affordance** (the `useLogout` hook + `logout-button` testID existed but were never rendered); the header applied no top safe-area inset | Added a logout button to the Users header and padded the header by `insets.top` |

### Test-stability fixes (automation, not assertions)
- `launch-fresh.yaml` used a one-shot `assertVisible` right after `clearState`; debug builds stream the JS bundle, so it raced the *"Bundling…"* screen → switched to `extendedWaitUntil`.
- `hideKeyboard` on Android issues a **BACK gesture** that pops pushed screens (and can background the app from the root). Removed it from the affected flows; buttons are now kept above the keyboard by fix #3 and tapped directly.
- Navigation/entrance-animation races → `assertVisible` after a transition replaced with `extendedWaitUntil`.

---

## Root cause detail & how to reproduce

### Bug 1 — Users screen crash (backend↔app contract)
**Reproduce (pre-fix):** log in as SAAS_ADMIN against the real API → the User List
mounts → red-box `toUpperCase of undefined`.
**Why:** `GET /users` → `{ items:[{ id,name,email,phone,isActive,… }] }` — no `status`,
no `role`, no `meta`. `UserListItem` rendered `<StatusBadge status={user.status} />`.
**Fix:** [src/features/users/types/index.ts](src/features/users/types/index.ts) (`mapApiUserToUser`,
`mapApiUserList`), wired through [src/features/users/services/users.service.ts](src/features/users/services/users.service.ts);
defensive [src/components/StatusBadge/index.tsx](src/components/StatusBadge/index.tsx).
**Note for backend:** the `/users` list DTO should include `role` (and ideally a `status`
enum) so the role badge can be accurate — today it falls back to "Farm Owner".

### Bug 2 — interceptor swallows auth 401s
**Reproduce (pre-fix):** log in with a wrong password → toast reads
*"Something went wrong. Please try again."*
**Fix:** [src/api/interceptors.ts](src/api/interceptors.ts) — bail out of the refresh
path when the failing request is an auth endpoint. Regression test added in
[src/api/__tests__/interceptors.test.ts](src/api/__tests__/interceptors.test.ts).

### Bug 3 — keyboard covers fields/buttons (Android 15 edge-to-edge)
**Reproduce (pre-fix):** open Reset Password, focus a field → the "Reset Password"
button sits under the keyboard with no way to reach it.
**Fix:** [src/features/auth/components/AuthScreenLayout.tsx](src/features/auth/components/AuthScreenLayout.tsx)
and [src/features/auth/screens/LoginScreen.tsx](src/features/auth/screens/LoginScreen.tsx).

### Bug 4 — invalid OTP reached the reset screen
**Reproduce (pre-fix):** request a reset code, enter `000000`, fill a new password,
submit → only then bounced back.
**Fix (app):** [src/features/auth/screens/OtpVerificationScreen.tsx](src/features/auth/screens/OtpVerificationScreen.tsx)
+ new [src/features/auth/hooks/useVerifyOtp.ts](src/features/auth/hooks/useVerifyOtp.ts)
+ [src/features/auth/services/otp.service.ts](src/features/auth/services/otp.service.ts).
**Fix (backend):** `farmseasy-api/src/modules/otp/otp.service.ts` — `verify()` now
validates **without** consuming (failed attempts still counted); `verifyAndConsume()`
(used by reset/change) consumes. Verified: wrong→401, correct→200 (repeatable),
reset→consumes, post-reset verify→invalid. Spec: `farmseasy-api/src/modules/otp/otp.service.spec.ts`.

### Bug 5 — no logout / header under status bar
**Fix:** [src/features/users/screens/UserListScreen.tsx](src/features/users/screens/UserListScreen.tsx).

---

## E2E coverage (Maestro)

| Flow | Status | Notes |
|---|---|---|
| login/empty-form-validation | ✅ | inline "required" validation |
| login/password-visibility-toggle | ✅ | |
| login/successful-login | ✅ | real API |
| login/invalid-login | ✅ | now shows correct 401 copy (bug 2) |
| forgot-password/invalid-email-validation | ✅ | client-side |
| forgot-password/request-otp | ✅ | real API |
| forgot-password/invalid-otp | ✅ | **rejected on OTP screen** (bug 4) |
| forgot-password/reset-password-success | ✅ | real OTP via Mailpit |
| forgot-password/resend-otp | ✅ | 30s cooldown |
| session/session-restore | ✅ | survives restart |
| session/logout | ✅ | logout button (bug 5) |
| session/session-expiry | ⏳ | needs a backend session-revocation test hook (documented in the flow); covered by interceptor unit tests |

Run them all: see [maestro/run-e2e.sh](../maestro/run-e2e.sh) and [maestro/README.md](../maestro/README.md).

## Lint & type-check
- `npm run type-check` — **0 errors**.
- `npm run lint` — **0 problems**, including `--max-warnings=0` (the pre-commit gate).
  Cleared the pre-existing debt: typed the TanStack-Query user hooks with explicit
  `UseQueryResult<…>` returns (the complex inferred union was resolving to `any`
  at consumers), typed the lazy-required DateTimePicker, `void`-wrapped async
  `onPress`, cast image `require()`s to `ImageSourcePropType`, fixed import order,
  and justified the two RN-idiom disables: `no-require-imports` off (Metro asset
  `require()`) and `no-inline-styles` off (the DS computes styles from theme
  tokens at runtime). The interceptor re-rejects the original Axios error on
  purpose (bug #2 depends on `response.status` surviving) — kept with a local,
  documented disable.

## Unit / integration (Jest)
- **225 tests across 23 suites pass.** Coverage **93.2% stmts / 87.0% branch / 94.7% lines**.
- New/updated: interceptor auth-401 regression, users `mapApiUser*`, OTP-screen
  verify-before-advance (incl. invalid-OTP), backend OTP non-consuming spec.
- Known-minor: a *"worker process failed to exit gracefully"* notice on the full
  run — `--detectOpenHandles` reports no real open handle (benign RN+Jest timing);
  `npm run test:ci` already passes `--forceExit`.

---

## Files modified / added

**App fixes:** `src/api/interceptors.ts`, `src/components/StatusBadge/index.tsx`,
`src/features/users/{types/index.ts,services/users.service.ts,screens/UserListScreen.tsx}`,
`src/features/auth/components/AuthScreenLayout.tsx`,
`src/features/auth/screens/{LoginScreen.tsx,OtpVerificationScreen.tsx}`,
`src/features/auth/services/otp.service.ts`, `src/features/auth/types/index.ts`.
**New:** `src/features/auth/hooks/useVerifyOtp.ts`.
**Backend:** `farmseasy-api/src/modules/otp/otp.service.ts` (+ `.spec.ts`).
**Tooling/tests:** `tsconfig.json`, `babel.config.js`, `.eslintrc.js`,
`src/test-utils/mockNavigation.ts`, `src/api/__tests__/interceptors.test.ts`,
`src/features/users/__tests__/mapApiUser.test.ts`,
`src/features/auth/__tests__/{OtpVerificationScreen,useCountdown}.test.tsx`.
**E2E:** `maestro/shared/{launch-fresh,login}.yaml`, all `maestro/login/*` and
`maestro/forgot-password/*`, `maestro/forgot-password/_reset-continue.yaml` (new),
`maestro/run-e2e.sh` (new).

## Recommendations
1. **Backend `/users` DTO**: include `role` (and a `status` enum) so the role badge is accurate.
2. **Token refresh e2e**: add a backend test hook to revoke a session so `session-expiry` can run unattended.
3. **CI**: gate on `type-check`, `lint`, `test:ci`, then the Maestro suite on an API-35 AVD with the API + Mailpit in docker-compose.
4. **Lint debt**: cleared in this pass — `npm run lint` is now clean at `--max-warnings=0`, so the pre-commit hook passes without `--no-verify`.
5. **Edge-to-edge**: audit any other custom headers/footers for status-bar / nav-bar insets now that API 35 is the target.
