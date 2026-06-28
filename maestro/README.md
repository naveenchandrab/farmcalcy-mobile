# Maestro E2E — Authentication

End-to-end UI flows for the FarmCalcy auth module, driven by
[Maestro](https://maestro.mobile.dev). They run against a **real build** on an
emulator/simulator or device and exercise the same `testID`s the Jest suite
uses (see `src/constants/testIDs.ts`).

```
maestro/
├── config.yaml                 # appId + default test data (override with -e)
├── shared/                     # reusable subflows (runFlow targets)
│   ├── launch-fresh.yaml       # cold launch from a clean, logged-out state
│   └── login.yaml              # perform a successful login
├── login/
│   ├── successful-login.yaml
│   ├── invalid-login.yaml
│   ├── empty-form-validation.yaml
│   └── password-visibility-toggle.yaml
├── forgot-password/
│   ├── request-otp.yaml
│   ├── invalid-email-validation.yaml
│   ├── invalid-otp.yaml          # wrong code → inline error, stays on OTP screen
│   ├── reset-password-success.yaml
│   ├── _reset-continue.yaml      # fragment: enters a supplied OTP, used by run-e2e.sh
│   └── resend-otp.yaml
├── session/
│   ├── session-restore.yaml
│   ├── logout.yaml
│   └── session-expiry.yaml
└── run-e2e.sh                    # orchestrates the whole suite + real-OTP capture
```

## Prerequisites

- Maestro installed: `npm run e2e:install` (or `curl -Ls https://get.maestro.mobile.dev | bash`)
- A running emulator/simulator with the app installed:
  `npm run android` or `npm run ios`
- A reachable backend (or mock server) and a seeded user matching the
  credentials in `config.yaml`.

## Running

```bash
# Recommended — runs the whole suite and captures the real emailed OTP for the
# reset happy path (see "OTP capture" below). Needs the API + Mailpit running.
EMAIL=admin@farmcalcy.com PASSWORD='ChangeMe123@' ./maestro/run-e2e.sh

# Or individual areas / flows:
npm run e2e:login           # just maestro/login
npm run e2e:forgot          # just maestro/forgot-password
npm run e2e:session         # just maestro/session
maestro test maestro/login/successful-login.yaml   # a single flow

# Override test data at runtime:
maestro test -e EMAIL=qa@farmcalcy.com -e PASSWORD=Secret123 maestro/login
```

> Don't run `maestro test maestro/` over the whole tree directly: `reset-password-success.yaml`
> needs a real `-e OTP=…`, and `_reset-continue.yaml` is a fragment that assumes you
> are already on the OTP screen. Use `run-e2e.sh`, which sequences them correctly.

## OTP capture (reset happy path)

`/otp/verify` and `/auth/reset-password` need the **real** 6-digit code the backend
emails. Locally the API delivers mail to **Mailpit** (`docker compose up` in
`farmcalcy-api`; SMTP `:1025`, web/API `:8025`). `run-e2e.sh`:

1. drives the app to the OTP screen (which triggers the email),
2. reads the latest code back from Mailpit's API (`GET :8025/api/v1/messages`),
3. feeds it into `_reset-continue.yaml` via `-e OTP=<code>`.

For CI, either keep this Mailpit step or expose a deterministic staging OTP.

## Notes on data-dependent flows

- **invalid-otp** uses a wrong code (`000000`) and asserts the inline error +
  that the user stays on the OTP screen (the OTP is validated via `/otp/verify`,
  which does **not** consume it, before the reset screen is shown).
- **session-expiry** needs the session revoked out-of-band after login (a backend
  test hook or a short-TTL staging token). Until that hook exists it is the one
  flow not run unattended; the auto-logout path is covered by the interceptor
  unit tests (`src/api/__tests__/interceptors.test.ts`).
- **Android keyboard:** flows do **not** use `hideKeyboard` — on Android it issues
  a BACK gesture that pops pushed screens. Submit buttons are kept above the
  keyboard by the screens' keyboard-avoidance, so they're tapped directly.
