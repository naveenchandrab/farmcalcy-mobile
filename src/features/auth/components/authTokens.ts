/**
 * Auth screen design tokens — sourced directly from the FarmsEasy login design.
 *
 * These are intentionally local to the auth feature: the login screen uses the
 * brand's medium "kelly" green (#0B7A3E) and placeholder-style inputs, which
 * differ from the app-wide design-system surfaces. Keeping the values here in a
 * single place avoids magic numbers and repetition across the auth components.
 */

export const AUTH_COLORS = {
  /** Primary brand green — Welcome heading, button, links, checkbox */
  primary: '#0B7A3E',
  /** Deep forest green — logo "Farm" wordmark + "Poultry Suite" */
  logoGreen: '#1B5E20',
  /** Accent orange — logo "Calcy" wordmark */
  orange: '#F28C28',

  background: '#FFFFFF',
  surface: '#FFFFFF',

  textPrimary: '#1F2937',
  textSecondary: '#6B7280',

  inputBorder: '#E8E8E8',
  inputBorderFocus: '#0B7A3E',
  placeholder: '#A5A5A5',

  error: '#D32F2F',
  white: '#FFFFFF',
} as const;

/**
 * Inter font families (static instances bundled in src/assets/fonts).
 * Use `fontFamily` rather than `fontWeight` so the correct weight renders
 * consistently on both Android and iOS.
 */
export const AUTH_FONT = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semibold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
  extrabold: 'Inter-ExtraBold',
} as const;

export const AUTH_TYPE = {
  heading: 34,
  subheading: 18,
  input: 16,
  button: 18,
  register: 16,
  label: 15,
} as const;

export const AUTH_SPACING = {
  screenHorizontal: 24,
  logoToWelcome: 36,
  welcomeToUsername: 28,
  fieldGap: 20,
  passwordToRemember: 20,
  rememberToLogin: 24,
  loginToRegister: 30,
  inputHeight: 58,
  inputRadius: 14,
  inputPaddingHorizontal: 16,
  buttonHeight: 56,
  buttonRadius: 14,
} as const;
