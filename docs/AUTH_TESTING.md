# Authentication Test Suite

Production-grade automated tests for the entire FarmsEasy authentication module:
login, forgot-password (OTP), reset-password, forced first-login change, session
management and the supporting services/store/interceptors.

---

## 1. Testing Overview

### Strategy — the test pyramid

| Layer | Tooling | What it covers | Where |
|------|---------|----------------|-------|
| **Unit** | Jest | Pure logic: zod schemas, password policy, email masking, error mapper, `mapAuthUserToUser`, `useCountdown`, services, store | `src/**/__tests__/*.test.ts` |
| **Integration** | Jest + React Native Testing Library | Screens with real form/validation/navigation/React-Query wiring; native modules mocked | `src/features/auth/__tests__/*Screen.test.tsx` |
| **E2E** | Maestro | Full user journeys on a real build (emulator/device) | `maestro/` |

The bulk of the assertions live in the fast unit/integration layers; Maestro
covers a thin set of critical end-to-end journeys.

### Architecture

- **No network, no device for Jest.** Every native module the auth flow touches
  is mocked once in `jest.setup.js` (Keychain, AsyncStorage, Reanimated,
  vector-icons, safe-area-context, gesture-handler, toasts).
- **Shared toolkit** in `src/test-utils/` removes boilerplate:
  `renderWithProviders`, `renderHookWithProviders`, `makeScreenProps`,
  factories (`makeUser`, `makeLoginResponse`, …), API error builders
  (`httpError`, `networkError`, `timeoutError`, `validationError`) and the
  `TEST_IDS` registry.
- **Single source of truth for testIDs.** `src/constants/testIDs.ts` is imported
  by production screens AND tests AND Maestro flows — rename once, update
  everywhere.

### Folder structure

```
farmseasy-mobile/
├── jest.config.js               # preset, aliases, coverage thresholds
├── jest.setup.js                # global native-module mocks
├── src/
│   ├── constants/testIDs.ts     # canonical testID registry (production)
│   ├── test-utils/              # the reusable test toolkit
│   │   ├── index.ts             #   barrel — import everything from '@test-utils'
│   │   ├── renderWithProviders.tsx
│   │   ├── mockNavigation.ts
│   │   ├── factories.ts
│   │   ├── apiMocks.ts
│   │   └── testIDs.ts           #   re-exports @constants/testIDs
│   ├── features/auth/__tests__/ # auth unit + integration tests
│   ├── services/__tests__/      # TokenService, ApiErrorMapper
│   ├── store/__tests__/         # authStore
│   └── api/__tests__/           # axios interceptors (refresh/auto-logout)
└── maestro/                     # E2E flows (see maestro/README.md)
```

---

## 2. How to Run Tests

All commands run from `farmseasy-mobile/`.

```bash
# Install dependencies (first time)
npm install

# Unit + integration
npm test                       # the whole Jest suite
npm run test:auth              # only src/features/auth
npm run test:watch             # watch mode (TDD)
npm run test:coverage          # with coverage report + thresholds
npm run test:ci                # CI mode: runInBand, coverage, JUnit report

# A single file / a single test
npx jest LoginScreen
npx jest src/features/auth/__tests__/schemas.test.ts
npx jest -t "invalid credentials"        # by test name

# End-to-end (Maestro — needs an emulator/simulator + the app installed)
npm run e2e:install            # install the Maestro CLI
npm run android                # or: npm run ios  (build + launch the app)
npm run e2e                    # all flows
npm run e2e:login              # maestro/login
npm run e2e:forgot             # maestro/forgot-password
npm run e2e:session            # maestro/session
maestro test maestro/login/successful-login.yaml   # one flow

# Run all authentication tests (Jest auth + Maestro auth)
npm run test:auth && npm run e2e
```

Coverage HTML report: open `coverage/lcov-report/index.html` after `test:coverage`.

---

## 3. Prerequisites

| Tool | Version | Needed for |
|------|---------|-----------|
| Node | ≥ 18 (CI uses 20) | everything |
| npm | ≥ 9 | dependency install |
| JDK | 17 | Android build (E2E) |
| Android Studio + SDK | platform 31+, an AVD | Android emulator (E2E) |
| Xcode (macOS) | 15+ | iOS simulator (E2E) |
| Maestro CLI | latest | E2E (`npm run e2e:install`) |
| Watchman (optional) | latest | faster Metro/Jest on macOS |

**Jest needs none of the native toolchain** — it runs in pure Node. Only the
Maestro E2E layer needs an emulator/simulator and a reachable backend (or mock
server) plus a seeded user that matches `maestro/config.yaml`.

Environment: tests mock `react-native-config`, so no `.env` is required to run
Jest. The app build (for E2E) reads `.env.development` as usual.

---

## 4. Troubleshooting Guide

| Symptom | Fix |
|---------|-----|
| `Cannot find module '@features/...'` in a test | The alias lives in `jest.config.js → moduleNameMapper`; mirror any new `tsconfig`/babel alias there. |
| `BASE_URL is not defined` | `react-native-config` isn't mocked — ensure `jest.setup.js` is on `setupFilesAfterEnv` (it is by default). |
| `The module factory of jest.mock() is not allowed to reference out-of-scope variables` | Prefix the captured variable with `mock` (e.g. `mockCountdownState`). |
| Reanimated / `FadeInDown` errors | Covered by the custom mock in `jest.setup.js`; if a NEW animation is used, add it to that mock's builder list. |
| "not wrapped in act(...)" from a timer | Use fake timers and drop pending intervals with `jest.clearAllTimers()` in `afterEach` (see `useCountdown.test.tsx`). |
| A worker "failed to exit gracefully" | A leaked timer/handle. Clear intervals on unmount and use `--detectOpenHandles` to locate it. |
| Coverage threshold failure | Run `npm run test:coverage` and read the per-file table; add tests or justify an exclusion in `collectCoverageFrom`. |
| Maestro: `no devices connected` | Boot an emulator/simulator first; `adb devices` should list it. |
| Maestro: element not found | Confirm the screen wires the `TEST_IDS` value; Maestro `id:` matches RN `testID`. |
| Stale Metro / weird bundling | `npm start -- --reset-cache`. |
| Android Gradle cache issues | `cd android && ./gradlew clean`. |
| iOS build cache issues | `cd ios && rm -rf build && pod install`. |
| Jest cache issues | `npx jest --clearCache`. |

---

## 5. Best Practices

### Writing a new test
1. **Arrange-Act-Assert.** Keep arrange tiny by using the factories.
2. **Query by intent.** Prefer `getByTestId(TEST_IDS.…)`; fall back to role/label
   for accessibility assertions. Never query by style or tree position.
3. **Mock at the seam, not the internals.** Mock the *service* (`auth.service`)
   or the *native module*, not React Query or react-hook-form. Let the real
   validation/store logic run — that's what you're testing.
4. **One behaviour per `it`.** The name states the behaviour, not the mechanics
   ("keeps the user logged out on invalid credentials").
5. **Await async UI** with `waitFor` / `findBy*`; never a bare `setTimeout`.

### Naming conventions
- Files: `<Unit>.test.ts(x)` next to a `__tests__/` folder.
- `describe` = the unit/screen; nested `describe` = a behaviour group;
  `it('does X when Y')`.

### Avoiding flaky tests
- Reset shared singletons (`authStore`, Keychain) in `beforeEach` — done globally
  for Keychain in `jest.setup.js`.
- Use a fresh QueryClient per render (`renderWithProviders` does this) so cache
  never leaks between tests.
- Control time with fake timers; never rely on wall-clock waits.

### Mocking guidelines
- Native modules: once, in `jest.setup.js`.
- Per-test service behaviour: `mockResolvedValueOnce` / `mockRejectedValueOnce`
  with the builders in `apiMocks.ts` so the real `ApiErrorMapper` runs.

### Code-review checklist
- [ ] New interactive element has a `TEST_IDS` entry and is wired in the screen.
- [ ] Happy path **and** at least one failure path (network/timeout/4xx) covered.
- [ ] No `console` noise; no `act()` warnings; no open-handle warnings.
- [ ] Coverage thresholds still pass (`npm run test:coverage`).
- [ ] New Maestro `id:` references match the `TEST_IDS` value.

---

## 6. API Mocking

Reusable Axios-shaped builders live in `src/test-utils/apiMocks.ts` and feed the
real `ApiErrorMapper` so error copy is asserted exactly as users see it:

| Scenario | Builder |
|----------|---------|
| Success envelope | `axiosResponse(data)` / `apiEnvelope(data)` |
| Validation (400/422 with field errors) | `validationError(['msg'])` |
| Unauthorized / forbidden / rate-limit / server | `httpError(401 \| 403 \| 429 \| 500)` |
| No internet | `networkError()` |
| Timeout (`ECONNABORTED`) | `timeoutError()` |

```ts
mockLogin.mockRejectedValueOnce(httpError(401));   // → "email or password … incorrect"
mockForgot.mockRejectedValueOnce(networkError());  // → "check your internet connection"
```

For Maestro, point the app at a mock server (e.g. WireMock / a staging backend
with deterministic OTPs) to exercise expiry/timeout journeys deterministically.

---

## 7. Coverage

Thresholds enforced in `jest.config.js` (suite fails CI below them):

| Metric | Threshold |
|--------|-----------|
| Statements | 90% |
| Branches | 85% |
| Functions | 90% |
| Lines | 90% |

`collectCoverageFrom` is scoped to the auth feature plus the shared
`TokenService`, `ApiErrorMapper`, `authStore` and the axios `interceptors`.

**Intentionally excluded / lower-covered:**
- `RegisterScreen.tsx` — a forward-compat placeholder not yet backed by the API.
- Barrel `index.ts` files and `*.stories.tsx` — no logic.
- A few presentational branches (pure style/animation entering props) that carry
  no behaviour and would only be exercised by snapshot noise.
