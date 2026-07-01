# FarmsEasy Mobile

**Poultry Contract Farming Management System (PCFMS)**  
React Native mobile app for Android and iOS.

> **New to this repo?** Read in this order:
> 1. [Overview](#overview) — what the app is and the roles it serves.
> 2. [Getting Started](#getting-started) → [Backend API (local development)](#backend-api-local-development) → [Running the App](#running-the-app) — get it building and talking to the API.
> 3. [docs/architecture.md](docs/architecture.md) + [docs/state-management.md](docs/state-management.md) + [docs/navigation.md](docs/navigation.md) — how the app is wired.
> 4. [docs/coding-guidelines.md](docs/coding-guidelines.md) — conventions to follow before your first PR.

---

## Table of Contents

- [Overview](#overview)
- [Documentation](#documentation)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Backend API (local development)](#backend-api-local-development)
- [Running the App](#running-the-app)
- [Storybook](#storybook)
- [Project Structure](#project-structure)
- [Scripts Reference](#scripts-reference)
- [Architecture](#architecture)
- [Build & Release](#build--release)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Overview

FarmsEasy is the mobile client for PCFMS — a platform that manages poultry contract farming operations across four user roles:

| Role | Access |
|------|--------|
| **SAAS_ADMIN** | Platform-wide: companies, subscriptions, all users |
| **TENANT_ADMIN** | Company-wide: farms, farmers, supervisors, batches, contracts |
| **SUPERVISOR** | Assigned batches: feed, mortality, weight, harvest records |
| **FARM_OWNER** | Read-only: own farm performance dashboard |

**Phase 1 is complete** — authentication, session management, and SAAS admin user management are fully implemented. See [docs/PHASES.md](docs/PHASES.md) for the full roadmap.

---

## Documentation

| Doc | What it covers |
|---|---|
| [project-context-mobile.md](docs/project-context-mobile.md) | Product overview, domain, user roles |
| [architecture.md](docs/architecture.md) | App layering, folders, data flow |
| [state-management.md](docs/state-management.md) | Zustand vs TanStack Query, selector rules |
| [navigation.md](docs/navigation.md) | Navigator tree and role-based routing |
| [api-integration.md](docs/api-integration.md) | Axios setup, interceptors, error mapping |
| [ui-design-system.md](docs/ui-design-system.md) | Design tokens, components, theming |
| [coding-guidelines.md](docs/coding-guidelines.md) | Code style, naming, commit conventions |
| [android-emulator-setup.md](docs/android-emulator-setup.md) | Emulator install, PATH, common emulator errors |
| [AUTH_TESTING.md](docs/AUTH_TESTING.md) | Manual auth-flow test scenarios |
| [QA_REPORT.md](docs/QA_REPORT.md) | QA findings and verification status |
| [maestro/README.md](maestro/README.md) | End-to-end (Maestro) test suite |
| [feature-roadmap.md](docs/feature-roadmap.md) · [PHASES.md](docs/PHASES.md) | Feature roadmap and delivery phases |

---

## Tech Stack

| Concern | Library | Version |
|---------|---------|---------|
| Framework | React Native (New Architecture) | 0.76.5 |
| Language | TypeScript (strict mode) | 5.0.4 |
| Navigation | React Navigation v7 | 7.x |
| Global state | Zustand | 5.x |
| Server state | TanStack Query | 5.x |
| Forms | React Hook Form + Zod | 7.x / 3.x |
| HTTP client | Axios | 1.x |
| Secure storage | react-native-keychain | 9.x |
| Key-value cache | react-native-mmkv | 3.x |
| Environment config | react-native-config | 1.6.x |
| Component explorer | Storybook for React Native | 8.3.x |

---

## Prerequisites

### All platforms

| Tool | Minimum version | Notes |
|------|----------------|-------|
| Node.js | 20 LTS | Use `nvm` or `fnm` to manage versions |
| npm | 10+ | Comes with Node |
| Java (JDK) | 17 | Use [Azul Zulu JDK 17](https://www.azul.com/downloads/) — required by Gradle 8 |
| Git | Any recent | — |

### Android

| Tool | Notes |
|------|-------|
| Android Studio | Install via [developer.android.com](https://developer.android.com/studio) |
| Android SDK | API level 35 (Android 15), min API 24 (Android 7.0) |
| NDK | 26.1.10909125 — install via SDK Manager → SDK Tools → NDK (Side by side) |
| Build Tools | 35.0.0 |
| Emulator **or** physical device | API 35 recommended |

Set the following environment variables (add to `~/.zshrc` or `~/.bashrc`):

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk          # macOS
# export ANDROID_HOME=$HOME/Android/Sdk               # Linux
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### iOS (macOS only)

| Tool | Notes |
|------|-------|
| Xcode | 16+ from the Mac App Store |
| Xcode Command Line Tools | `xcode-select --install` |
| CocoaPods | `sudo gem install cocoapods` or `brew install cocoapods` |
| Simulator | iOS 15+ |

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/naveenchandrab/farmseasy-mobile.git
cd farmseasy-mobile
npm install
```

### 2. iOS only — install CocoaPods

```bash
cd ios && pod install && cd ..
```

### 3. Create your environment file

The app reads environment variables from a `.env` file at **build time** via `react-native-config`. The file is not committed to git.

```bash
cp .env.development .env     # use development defaults for local work
```

> **Why do I need `.env` at the root?**  
> `react-native-config`'s `dotenv.gradle` reads the root `.env` file during every Android Gradle build and bakes the values into `BuildConfig`. Without it, the `RNCConfigModule` TurboModule initialises but returns empty config, causing a crash in `src/config/env.ts`.

For environment-specific builds, set `ENVFILE` before running npm scripts (already wired into the `package.json` scripts):

```bash
# The npm scripts already set ENVFILE:
npm run start:dev        # ENVFILE=.env.development
npm run start:staging    # ENVFILE=.env.staging
npm run start:prod       # ENVFILE=.env.production
```

---

## Environment Configuration

### Environment files

| File | Purpose |
|------|---------|
| `.env` | **Required at the repo root** — used by `dotenv.gradle` during every Android Gradle build |
| `.env.development` | Development API (defaults to the Android emulator host `http://10.0.2.2:3000/api/v1`) |
| `.env.staging` | Staging API |
| `.env.production` | Production API |

All `.env*` files are gitignored. Never commit real API endpoints or secrets.

### Required variables

```dotenv
BASE_URL=http://10.0.2.2:3000/api/v1    # NestJS REST API — no trailing slash
APP_ENV=development                      # development | staging | production
```

> **`BASE_URL` host depends on where the app runs** (the dev API listens on the
> *host machine's* `localhost:3000`):
>
> | Target | `BASE_URL` host |
> |--------|-----------------|
> | Android emulator (AVD) | `http://10.0.2.2:3000/api/v1` ← repo default |
> | iOS simulator | `http://localhost:3000/api/v1` |
> | Physical device (any OS) | `http://<your-machine-LAN-IP>:3000/api/v1` (same Wi-Fi) |
>
> `react-native-config` **bakes `.env` into the native binary at build time**, so
> after changing `BASE_URL` you must rebuild (`npm run android` / `npm run ios`) —
> a Metro reload is not enough. Cleartext HTTP is already allowed for **debug**
> builds only (`android/app/src/debug/AndroidManifest.xml`); release builds remain
> HTTPS-only.

### TypeScript types

`src/types/react-native-config.d.ts` declares the `Config` type so every `Config.BASE_URL` access is fully typed.

---

## Backend API (local development)

The app talks to the **FarmsEasy NestJS API** (`../farmseasy-api`). Auth screens
(Login, Forgot Password, OTP, Reset Password) will show **"Unable to connect to
the server"** until that API — and its Postgres, Redis and mail services — are
running. Start them from the `farmseasy-api` directory:

```bash
cd ../farmseasy-api

# 1. Start Postgres + Redis (Docker Desktop must be running)
docker compose up -d postgres redis

# 2. Apply the DB schema and seed the first login account (first run only)
npm run prisma:generate
npx prisma migrate deploy        # or: npm run prisma:migrate:dev
npm run prisma:seed

# 3. Start the API in watch mode (listens on http://localhost:3000)
npm run start:dev
```

Verify it is up: `curl http://localhost:3000/api/v1/health` → `{"status":"ok",…}`.

### Seed login

| Field | Value |
|-------|-------|
| Email | `admin@farmseasy.com` |
| Password | `ChangeMe123@` |
| Role | `SAAS_ADMIN` |

### OTP emails (Forgot Password / forced password change)

OTPs are **emailed**, not returned in the API response. In development the API
sends to SMTP `localhost:1025`. Run a local inbox to read the codes — Mailpit is
a maintained, Apple-Silicon-native, MailHog-compatible drop-in on the same ports:

```bash
docker run -d --name farmseasy-mailpit -p 1025:1025 -p 8025:8025 axllent/mailpit
```

Open the inbox at **http://localhost:8025** to read the 6-digit OTP (valid 10
minutes, 5 attempts). Trigger one from the app's Forgot Password screen, or:

```bash
curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" -d '{"email":"admin@farmseasy.com"}'
```

### Shutting down

```bash
docker rm -f farmseasy-mailpit          # stop the mail inbox
cd ../farmseasy-api && docker compose down   # stop Postgres + Redis
```

---

## Running the App

### Start Metro

Metro must be running before you launch on a device or emulator.

```bash
npm run start          # plain start (uses root .env)
npm run start:dev      # explicitly loads .env.development
```

Add `-- --reset-cache` to clear the Metro transform cache:

```bash
npm run start:dev -- --reset-cache
```

### Android

```bash
# Run on connected device / running emulator (development .env)
npm run build:android:dev

# Or use the shorthand (uses root .env)
npm run android
```

To launch a specific emulator first:

```bash
$ANDROID_HOME/emulator/emulator -avd Medium_Phone_API_35 -no-snapshot-load &
```

### iOS (macOS only)

```bash
npm run ios
```

### First-time Android build

The first Gradle build compiles all native modules including the codegen JNI bridges. It takes 3–8 minutes depending on hardware. Subsequent builds use the Gradle cache and are much faster.

If the build fails with a codegen error after changing `node_modules`, run:

```bash
cd android && ./gradlew clean && cd ..
npm run build:android:dev
```

---

## Storybook

FarmsEasy includes a full on-device Storybook powered by `@storybook/react-native` v8 with 27 story files covering every design system component.

### How it works

- `STORYBOOK=true` is inlined at bundle time by `babel-plugin-transform-inline-environment-variables`.
- `metro.config.js` always wraps config with `withStorybook` — when Storybook is disabled, all `@storybook/*` imports are replaced with empty modules so normal builds are unaffected.
- `index.js` conditionally mounts `StorybookUI` instead of the main `App`.

### Run Storybook

```bash
# Start Metro with Storybook enabled, then build
npm run storybook              # Metro only — pair with a separate run-android/ios call
npm run storybook:android      # Metro + Android in one command
npm run storybook:ios          # Metro + iOS in one command
```

> **Important:** After switching between Storybook and normal mode, always restart Metro with `--reset-cache`. The `STORYBOOK` env var is baked into the bundle at build time.

### Story locations

Stories live alongside their component:

```
src/design-system/components/Button/Button.stories.tsx
src/design-system/components/TextInput/TextInput.stories.tsx
...
```

`.storybook/storybook.requires.ts` is auto-generated by Metro on every Storybook start — it is gitignored.

---

## Project Structure

```
farmseasy-mobile/
├── .storybook/              # Storybook config (main.ts, preview.tsx, index.ts)
├── android/                 # Android native project
│   ├── app/
│   │   ├── build.gradle     # App-level build config, signing, dotenv.gradle
│   │   └── src/main/java/com/farmseasy/pcfms/
│   │       ├── MainApplication.kt
│   │       └── MainActivity.kt
│   ├── gradle.properties    # New Architecture enabled, JVM heap, parallelism
│   └── settings.gradle      # Autolinking via autolinkLibrariesFromCommand()
├── ios/                     # iOS native project
│   ├── FarmsEasy/
│   │   ├── Info.plist       # Permissions, background modes, ATS config
│   │   └── PrivacyInfo.xcprivacy   # App Store privacy manifest (iOS 17.4+)
│   └── Podfile
├── src/
│   ├── api/
│   │   ├── axios.ts         # Axios instance (BASE_URL from react-native-config)
│   │   └── interceptors.ts  # JWT attach, 401 → token refresh → retry
│   ├── assets/
│   │   ├── fonts/           # Inter (Regular/Medium/SemiBold/Bold/ExtraBold) — see Fonts
│   │   └── images/          # splash-logo.png, splash-farm.png (brand splash art)
│   ├── config/
│   │   └── env.ts           # Typed, validated access to react-native-config values
│   ├── constants/           # STORAGE_KEY_USER, STORAGE_KEY_THEME, etc.
│   ├── design-system/
│   │   ├── components/      # 20+ production-ready components, each with stories
│   │   ├── theme/           # ThemeProvider, useTheme(), ThemeContext
│   │   └── tokens/          # colors, typography, spacing, radius, shadows, zIndex
│   ├── features/
│   │   ├── auth/            # Login, Register, session restore, role-based navigation
│   │   │   ├── components/  # Logo, AuthInput, AuthButton, Checkbox, authTokens
│   │   │   ├── screens/     # LoginScreen, RegisterScreen, ForgotPassword, OTP, Reset
│   │   │   ├── hooks/       # useLogin, useLogout
│   │   │   └── types/       # loginSchema, registerSchema (Zod)
│   │   └── users/           # User list, details, create, edit (SAAS_ADMIN)
│   ├── navigation/
│   │   ├── RootNavigator.tsx   # Splash → Auth | App (conditional stack)
│   │   ├── AuthNavigator.tsx   # Login, Register, ForgotPassword, OTP, Reset
│   │   └── AppNavigator.tsx    # Role → SaasAdminNavigator | TenantAdminNavigator
│   ├── screens/
│   │   └── SplashScreen.tsx
│   ├── services/
│   │   ├── TokenService.ts  # Keychain encapsulation — NEVER use AsyncStorage for tokens
│   │   ├── ApiErrorMapper.ts
│   │   └── queryClient.ts
│   ├── store/
│   │   ├── authStore.ts     # Zustand — user, isAuthenticated, isInitializing
│   │   └── themeStore.ts    # Zustand + persist — light | dark | system
│   ├── types/               # Shared TypeScript types and react-native-config.d.ts
│   └── utils/
│       └── toast.ts         # Imperative showSuccess / showError / showInfo / showWarning
├── .env.development         # Gitignored — create .env from this for local builds
├── .env.staging             # Gitignored
├── .env.production          # Gitignored
├── App.tsx                  # Root component — provider tree
├── index.js                 # Entry point — STORYBOOK flag → StorybookUI or App
├── babel.config.js          # module-resolver aliases, reanimated, env var inlining
├── metro.config.js          # Path aliases + withStorybook wrapper
├── react-native.config.js   # Explicit Android autolinking for react-native-config
└── tsconfig.json            # Strict mode, path aliases matching babel
```

---

## Scripts Reference

| Script | What it does |
|--------|-------------|
| `npm run android` | Run on Android device/emulator (uses root `.env`) |
| `npm run ios` | Run on iOS simulator |
| `npm run start` | Start Metro bundler |
| `npm run start:dev` | Metro with `.env.development` |
| `npm run start:staging` | Metro with `.env.staging` |
| `npm run start:prod` | Metro with `.env.production` |
| `npm run build:android:dev` | Full Android debug build with `.env.development` |
| `npm run build:android:staging` | Android release build with `.env.staging` |
| `npm run build:android:prod` | Android release build with `.env.production` |
| `npm run storybook` | Metro with Storybook enabled |
| `npm run storybook:android` | Metro + Android in Storybook mode |
| `npm run storybook:ios` | Metro + iOS in Storybook mode |
| `npm run lint` | ESLint across all `.ts` / `.tsx` / `.js` files |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm run format` | Prettier format `src/` |
| `npm run type-check` | TypeScript compilation check (no emit) |
| `npm run test` | Jest unit tests |
| `npm run test:coverage` | Jest with coverage report |

---

## Architecture

> Full references: [docs/architecture.md](docs/architecture.md) (layering & data flow), [docs/state-management.md](docs/state-management.md), [docs/navigation.md](docs/navigation.md), and [docs/api-integration.md](docs/api-integration.md). The sections below are the essentials.

### State management

| State type | Tool | Rule |
|------------|------|------|
| Client state (auth, theme) | Zustand | Never put API response data here |
| Server state | TanStack Query | Single source of truth for API data |
| Secure credentials | react-native-keychain | Tokens **only** — never AsyncStorage |
| Non-sensitive persistence | AsyncStorage / MMKV | User profile cache, theme preference |

> **Selector rule:** Always use primitive or `useShallow`-wrapped selectors with Zustand to avoid infinite re-render loops from `useSyncExternalStore`. Avoid `useStore(state => ({ a: state.a, b: state.b }))` — use `useShallow` or two separate calls.

### Absolute imports

All `src/` subdirectories are aliased in both `babel.config.js` and `tsconfig.json`:

```typescript
import { useAuthStore } from '@store/authStore';
import { Button } from '@design-system';
import { TokenService } from '@services/TokenService';
```

### Authentication flow

```
App launch
  └─ SplashScreen
       └─ authStore.initialize()
            ├─ Keychain.hasTokens() + AsyncStorage.getUser()
            ├─ Both present → isAuthenticated = true → AppStack
            ├─ Either missing → clear both → isAuthenticated = false → AuthStack
            └─ isInitializing = false (in finally)

API calls
  └─ Request interceptor: attach access token from Keychain
  └─ Response interceptor: 401 → refreshToken → retry (race condition guarded)
  └─ Refresh fails → logout → navigate to Auth stack
```

### Security rules

- Tokens live **exclusively** in Keychain (`react-native-keychain`). No token ever touches AsyncStorage.
- `TokenService.ts` is the only class that calls Keychain APIs — no other file imports `react-native-keychain` directly.
- URLs come from `react-native-config` — never hardcoded.
- `keystore.properties` and `*.keystore` (except `debug.keystore`) are gitignored.

---

## Branding & Assets

### Splash screen

`src/screens/SplashScreen.tsx` renders the branded FarmsEasy splash (logo badge,
"FarmsEasy / Poultry Suite" wordmark, farm banner with a misty top and curved
bottom wave, and animated loading dots). It is shown by `RootNavigator` while
`authStore.initialize()` restores the session. The brief native launch screen
(Android 12+ `SplashTheme`) uses `@color/splash_background` so it blends into it.

### App icon

The launcher icon is an Android **adaptive icon**:

- `mipmap-anydpi-v26/ic_launcher.xml` composes `@color/ic_launcher_background`
  (`#0B7131`, matching the icon's green) with `ic_launcher_foreground.png`.
- The foreground art is scaled to **~66% of the canvas** (the standard
  adaptive-icon safe zone) so the OEM mask (circle / squircle /
  rounded-square) never crops the logo. Legacy
  `ic_launcher.png` / `ic_launcher_round.png` carry the same safe padding.
- Master source: `../Logo/app-icon.png`. iOS variants live in
  `ios/FarmsEasy/Images.xcassets/AppIcon.appiconset/`.

### Fonts (Inter)

The UI uses [Inter](https://rsms.me/inter/). Static instances live in
`src/assets/fonts/` and are referenced by `fontFamily` (e.g. `Inter-SemiBold`)
rather than `fontWeight`, so weights render consistently on both platforms.

Wiring:

- **Registration:** `react-native.config.js` → `assets: ['./src/assets/fonts']`
- **Android:** copied to `android/app/src/main/assets/fonts/`
- **iOS:** registered via `UIAppFonts` in `ios/FarmsEasy/Info.plist`

After adding or changing a font file, re-link the native projects:

```bash
npx react-native-asset
```

> The `fontFamily` value must match each file's **PostScript name**
> (`Inter-Regular`, `Inter-Medium`, `Inter-SemiBold`, `Inter-Bold`,
> `Inter-ExtraBold`) — already verified for the bundled files.

---

## Build & Release

### Android debug APK (local device testing)

```bash
cd android
./gradlew assembleDebug
# Output: android/app/build/outputs/apk/debug/app-debug.apk
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### Android release APK

1. Create `android/keystore/keystore.properties` from the example:
   ```bash
   cp android/keystore/keystore.properties.example android/keystore/keystore.properties
   ```
2. Fill in your keystore path and credentials (never commit this file).
3. Build:
   ```bash
   ENVFILE=.env.production ./gradlew assembleRelease
   ```

### Android release AAB (Play Store)

```bash
ENVFILE=.env.production ./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### iOS release (macOS only)

Open `ios/FarmsEasy.xcworkspace` in Xcode, select a real device or "Any iOS Device", then **Product → Archive**.

---

## Troubleshooting

### Gradle build fails with "Unsupported class file major version" / a JDK error

Gradle 8.10 (RN 0.76) runs on **JDK 17**, not a newer JDK. If your system default
is JDK 21/23 the Android build fails. Point the build at JDK 17 explicitly:

```bash
brew install openjdk@17            # macOS (keg-only; no sudo)
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
./android/gradlew -p android :app:assembleDebug   # or: npm run android
```

### A text field or the submit button is hidden behind the keyboard

Android 15 (API 35) enforces **edge-to-edge**, so the legacy `adjustResize` no
longer shrinks the window. Screens must drive keyboard avoidance themselves —
the shared `AuthScreenLayout` and `LoginScreen` set `KeyboardAvoidingView
behavior="height"` on Android and `scrollToEnd` on keyboard-show. Re-use
`AuthScreenLayout` for new form screens so they inherit this behaviour.

### "Unable to connect to the server" on the Login / Auth screens

The app cannot reach the backend API. Check, in order:

1. **Is the API running?** `curl http://localhost:3000/api/v1/health` should return
   `{"status":"ok"}`. If not, start it — see [Backend API (local development)](#backend-api-local-development).
   Remember it also needs Postgres + Redis (`docker compose up -d postgres redis`).
2. **Right `BASE_URL` host for your target?** Android emulator must use
   `10.0.2.2` (not `localhost`); iOS simulator uses `localhost`; a physical device
   uses your machine's LAN IP. See [Required variables](#required-variables).
3. **Rebuilt after editing `.env`?** `react-native-config` bakes `BASE_URL` into
   the binary at build time — rerun `npm run android` / `npm run ios`, not just a
   Metro reload.
4. **Physical device:** confirm the phone and your machine are on the same Wi-Fi
   and no firewall blocks port 3000.

### OTP never arrives (Forgot Password / forced password change)

OTPs are emailed, not returned by the API. Start the local mail inbox and read the
code at `http://localhost:8025` — see [OTP emails](#otp-emails-forgot-password--forced-password-change).

### Android build fails with `No connected devices!`

The app compiled fine — `react-native run-android` just has **no device to install
on**. Start an emulator first, then re-run `npm run android`:

```bash
# Make sure the SDK tools are on PATH (add these to ~/.zshrc to persist):
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"

emulator -list-avds                 # see available virtual devices
emulator -avd <AVD_NAME> &          # e.g. Pixel_9_API_35
adb wait-for-device                 # wait until it appears
npm run android                     # build + install + launch
```

Confirm the device is visible with `adb devices` before building. For a physical
device, enable USB debugging and accept the RSA prompt. For emulator install,
PATH setup, and other emulator errors, see
[docs/android-emulator-setup.md](docs/android-emulator-setup.md).

### `TypeError: Cannot read property 'getConfig' of null`

`react-native-config`'s TurboModule is not registered. This happens when:

- **No root `.env` file** — `dotenv.gradle` needs a `.env` at the project root during Android builds. Run `cp .env.development .env`.
- **APK is stale** — The native layer must be rebuilt after any change to `react-native.config.js` or `android/app/build.gradle`. Run `./gradlew assembleDebug` from the `android/` directory.

### `@storybook/core/manager-api could not be found`

Storybook packages are being resolved in a non-Storybook build. Ensure `metro.config.js` always wraps the config with `withStorybook` and `onDisabledRemoveStorybook: true` is set.

### `process.env.STORYBOOK` is always `undefined`

Metro's `process.env` is a stub — it does **not** inherit shell environment variables. The `STORYBOOK` variable is inlined at compile time by `babel-plugin-transform-inline-environment-variables`. Always restart Metro with `--reset-cache` after switching modes.

### `Render Error: right operand of 'in' is not an object`

Version mismatch between `@react-navigation/native-stack` (7.x) and `react-native-screens`. The navigation package requires `>= 4.0.0`. The project pins `react-native-screens@^4.4.0` — if you see this error after updating packages, check that `react-native-screens` is still on 4.x and rebuild the native layer.

### `Maximum update depth exceeded` / `getSnapshot should be cached`

A Zustand selector is returning a **new object** on every call (e.g., `useStore(state => ({ a: state.a, b: state.b }))`). Use `useShallow` from `zustand/react/shallow` for object selectors, or use separate primitive selectors:

```typescript
// Bad — new object every render → infinite loop
const { isInitializing, isAuthenticated } = useAuthStore(state => ({
  isInitializing: state.isInitializing,
  isAuthenticated: state.isAuthenticated,
}));

// Good — useShallow does shallow equality comparison
import { useShallow } from 'zustand/react/shallow';
const { isInitializing, isAuthenticated } = useAuthStore(
  useShallow(state => ({ isInitializing: state.isInitializing, isAuthenticated: state.isAuthenticated })),
);

// Also good — separate primitive selectors
const isInitializing = useAuthStore(state => state.isInitializing);
const isAuthenticated = useAuthStore(state => state.isAuthenticated);
```

### Metro `EADDRINUSE: address already in use :::8081`

Another Metro instance is running. Kill it:

```bash
pkill -f "react-native start"
# or find and kill by port
lsof -ti:8081 | xargs kill -9
```

### Gradle build fails on `generateCodegenSchema`

A native module in `node_modules` uses codegen spec features not supported by RN 0.76's `@react-native/codegen`. Check which module is failing in the error output and pin it to a version compatible with RN 0.76.

### `./android/gradlew clean` fails with CMake `add_subdirectory ... which is not an existing directory`

`clean` also runs `:app:externalNativeBuildCleanDebug`/`...Release`, which reconfigures
CMake. The generated `Android-autolinking.cmake` unconditionally
`add_subdirectory()`s every autolinked library's codegen JNI folder
(`node_modules/<lib>/android/build/generated/source/codegen/jni/`), but those
folders are only created by each library's own codegen task as part of a real
build — `clean` never runs them. If those folders don't exist yet (fresh clone,
fresh `npm install`, or anything that wiped `node_modules/*/android/build`),
the native clean step fails with this CMake error even though nothing is
actually wrong with the project.

Skip the native clean sub-tasks (the JS/Java clean still runs, which is enough
to force fresh resources like the app icon to be repackaged):

```bash
./android/gradlew -p android clean -x :app:externalNativeBuildCleanDebug -x :app:externalNativeBuildCleanRelease
```

Or just delete the build output directories directly instead of invoking Gradle's clean:

```bash
rm -rf android/app/build android/app/.cxx
```

Either way, `npm run android` afterwards regenerates the codegen artifacts and
native build fresh, so this doesn't leave the project in a broken state.

### Clean build (when all else fails)

```bash
# Clear Metro cache
npm run start -- --reset-cache

# Clean Android build artifacts
cd android && ./gradlew clean && cd ..

# Clean node_modules and reinstall
rm -rf node_modules && npm install

# iOS — clean derived data and reinstall pods
cd ios && pod deintegrate && pod install && cd ..
```

---

## Contributing

1. Branch from `main`: `git checkout -b feat/your-feature`
2. Follow the coding guidelines in [docs/coding-guidelines.md](docs/coding-guidelines.md)
3. Run `npm run lint && npm run type-check && npm run test` before committing
4. Husky pre-commit hook runs lint-staged automatically on staged files
5. Open a pull request — describe what changed and why
