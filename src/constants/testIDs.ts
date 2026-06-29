/**
 * Stable testIDs for every interactive element in the auth flow.
 *
 * This lives in `@constants` (not the test toolkit) so PRODUCTION screens can
 * import it without pulling test-only code into the app bundle. Jest tests and
 * Maestro E2E flows reference the SAME identifiers via `@test-utils` — rename
 * once here, update everywhere.
 *
 * Values are kebab-case and human-readable so they read well in Maestro YAML
 * (`id: "login-email-input"`).
 */
export const TEST_IDS = {
  login: {
    screen: 'login-screen',
    emailInput: 'login-email-input',
    passwordInput: 'login-password-input',
    passwordToggle: 'login-password-toggle',
    rememberMe: 'login-remember-me',
    forgotPasswordLink: 'login-forgot-password-link',
    submitButton: 'login-button',
    registerLink: 'login-register-link',
  },
  forgotPassword: {
    screen: 'forgot-password-screen',
    emailInput: 'forgot-password-email-input',
    submitButton: 'forgot-password-button',
    backButton: 'forgot-password-back-button',
  },
  otp: {
    screen: 'otp-screen',
    input: 'otp-input',
    /** Per-cell id builder: otp-input-0 … otp-input-5. */
    cell: (index: number) => `otp-input-${index}`,
    submitButton: 'otp-submit-button',
    resendButton: 'otp-resend-button',
    resendTimer: 'otp-resend-timer',
    backButton: 'otp-back-button',
  },
  resetPassword: {
    screen: 'reset-password-screen',
    newPasswordInput: 'reset-password-new-input',
    newPasswordToggle: 'reset-password-new-toggle',
    confirmPasswordInput: 'reset-password-confirm-input',
    confirmPasswordToggle: 'reset-password-confirm-toggle',
    submitButton: 'reset-password-button',
    successView: 'reset-password-success',
    successCta: 'reset-password-success-cta',
    backButton: 'reset-password-back-button',
  },
  forceChange: {
    screen: 'force-change-screen',
    currentPasswordInput: 'force-change-current-input',
    currentPasswordToggle: 'force-change-current-toggle',
    otpInput: 'force-change-otp',
    newPasswordInput: 'force-change-new-input',
    confirmPasswordInput: 'force-change-confirm-input',
    confirmPasswordToggle: 'force-change-confirm-toggle',
    submitButton: 'force-change-button',
    resendButton: 'force-change-resend-button',
    resendTimer: 'force-change-resend-timer',
    differentAccountLink: 'force-change-different-account',
  },
  session: {
    openMenuButton: 'open-menu-button',
    logoutButton: 'logout-button',
  },
} as const;

export type TestIds = typeof TEST_IDS;
