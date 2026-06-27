# FarmCalcy Mobile

**Poultry Contract Farming Management System (PCFMS)**  
React Native mobile app for Android and iOS.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Running the App](#running-the-app)
- [Storybook](#storybook)
- [Project Structure](#project-structure)
- [Scripts Reference](#scripts-reference)
- [Architecture](#architecture)
- [Build & Release](#build--release)
- [Troubleshooting](#troubleshooting)

---

## Overview

FarmCalcy is the mobile client for PCFMS — a platform that manages poultry contract farming operations across four user roles:

| Role | Access |
|------|--------|
| **SAAS_ADMIN** | Platform-wide: companies, subscriptions, all users |
| **TENANT_ADMIN** | Company-wide: farms, farmers, supervisors, batches, contracts |
| **SUPERVISOR** | Assigned batches: feed, mortality, weight, harvest records |
| **FARM_OWNER** | Read-only: own farm performance dashboard |

**Phase 1 is complete** — authentication, session management, and SAAS admin user management are fully implemented. See [docs/PHASES.md](docs/PHASES.md) for the full roadmap.

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
git clone https://github.com/naveenchandrab/farmcalcy-mobile.git
cd farmcalcy-mobile
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
| `.env.development` | Development API (`http://localhost:3000/api/v1`) |
| `.env.staging` | Staging API |
| `.env.production` | Production API |

All `.env*` files are gitignored. Never commit real API endpoints or secrets.

### Required variables

```dotenv
BASE_URL=http://localhost:3000/api/v1   # NestJS REST API — no trailing slash
APP_ENV=development                      # development | staging | production
```

### TypeScript types

`src/types/react-native-config.d.ts` declares the `Config` type so every `Config.BASE_URL` access is fully typed.

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

FarmCalcy includes a full on-device Storybook powered by `@storybook/react-native` v8 with 27 story files covering every design system component.

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
farmcalcy-mobile/
├── .storybook/              # Storybook config (main.ts, preview.tsx, index.ts)
├── android/                 # Android native project
│   ├── app/
│   │   ├── build.gradle     # App-level build config, signing, dotenv.gradle
│   │   └── src/main/java/com/farmcalcy/pcfms/
│   │       ├── MainApplication.kt
│   │       └── MainActivity.kt
│   ├── gradle.properties    # New Architecture enabled, JVM heap, parallelism
│   └── settings.gradle      # Autolinking via autolinkLibrariesFromCommand()
├── ios/                     # iOS native project
│   ├── FarmCalcy/
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

`src/screens/SplashScreen.tsx` renders the branded FarmCalcy splash (logo badge,
"FarmCalcy / Poultry Suite" wordmark, farm banner with a misty top and curved
bottom wave, and animated loading dots). It is shown by `RootNavigator` while
`authStore.initialize()` restores the session. The brief native launch screen
(Android 12+ `SplashTheme`) uses `@color/splash_background` so it blends into it.

### App icon

The launcher icon is an Android **adaptive icon**:

- `mipmap-anydpi-v26/ic_launcher.xml` composes `@color/ic_launcher_background`
  (`#03441A`, matching the icon's green) with `ic_launcher_foreground.png`.
- The foreground art is scaled to **~80% of the canvas** so the OEM mask
  (circle / squircle / rounded-square) never crops the logo. Legacy
  `ic_launcher.png` / `ic_launcher_round.png` carry the same safe padding.
- Master source: `../Logo/app-icon.png`. iOS variants live in
  `ios/FarmCalcy/Images.xcassets/AppIcon.appiconset/`.

### Fonts (Inter)

The UI uses [Inter](https://rsms.me/inter/). Static instances live in
`src/assets/fonts/` and are referenced by `fontFamily` (e.g. `Inter-SemiBold`)
rather than `fontWeight`, so weights render consistently on both platforms.

Wiring:

- **Registration:** `react-native.config.js` → `assets: ['./src/assets/fonts']`
- **Android:** copied to `android/app/src/main/assets/fonts/`
- **iOS:** registered via `UIAppFonts` in `ios/FarmCalcy/Info.plist`

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

Open `ios/FarmCalcy.xcworkspace` in Xcode, select a real device or "Any iOS Device", then **Product → Archive**.

---

## Troubleshooting

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
