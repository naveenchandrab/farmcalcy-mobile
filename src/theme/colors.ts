/**
 * FarmCalcy / PCFMS brand color palette.
 *
 * Derived directly from the UI reference designs (June 2025).
 * All screen headers, navigation bars, and CTA buttons use the
 * BRAND_* greens. Amber is reserved for payment/financial CTAs.
 * Red is reserved for mortality, danger, and error states.
 *
 * Do NOT import these in business logic — use Paper theme tokens
 * (theme.colors.primary, theme.colors.error, etc.) instead.
 * Import these only in theme definition files.
 */
export const Colors = {
  // ─── Brand Greens ──────────────────────────────────────────────────────────
  /** App bars, bottom nav active, primary CTA buttons. */
  brandDark: '#1B3D1B',
  /** Secondary buttons, badges, section highlights. */
  brandMid: '#2E7D32',
  /** Tab bar active indicator, icon accents. */
  brandLight: '#4CAF50',
  /** Light tint for card surfaces & container backgrounds. */
  brandSurface: '#E8F5E9',
  /** Subtle green tint for row alternation or hover states. */
  brandSubtle: '#F1F8E9',

  // ─── Amber / Financial ─────────────────────────────────────────────────────
  /** "Make Payment" CTA, outstanding balance highlight, trial badge. */
  amber: '#F9A825',
  amberDark: '#F57F17',
  amberLight: '#FFF8E1',

  // ─── Red / Mortality & Danger ──────────────────────────────────────────────
  /** Mortality count, error states, logout, suspended badge. */
  danger: '#D32F2F',
  dangerLight: '#FFEBEE',
  dangerDark: '#B71C1C',

  // ─── Neutral ───────────────────────────────────────────────────────────────
  white: '#FFFFFF',
  /** App background (slightly off-white to reduce glare). */
  background: '#F7F9F7',
  /** Card surfaces. */
  surface: '#FFFFFF',
  /** Dividers, input outlines, list separators. */
  border: '#E0E0E0',
  /** Secondary text, placeholder, helper text. */
  textSecondary: '#757575',
  /** Primary content text. */
  textPrimary: '#1C1C1E',
  /** Disabled states. */
  disabled: '#BDBDBD',

  // ─── Dark mode surfaces ────────────────────────────────────────────────────
  darkBackground: '#121612',
  darkSurface: '#1E241E',
  darkSurfaceVariant: '#2A342A',
  darkBorder: '#3A4A3A',

  // ─── Status / Badge ────────────────────────────────────────────────────────
  /** "Paid", "Active", "Alive" badges. */
  statusGreen: '#2E7D32',
  statusGreenBg: '#E8F5E9',
  /** "Trial", "Pending", "Warning" badges. */
  statusAmber: '#F9A825',
  statusAmberBg: '#FFF8E1',
  /** "Expired", "Suspended", "Mortality" badges. */
  statusRed: '#D32F2F',
  statusRedBg: '#FFEBEE',
  /** "Inactive", "Cancelled" badges. */
  statusGrey: '#757575',
  statusGreyBg: '#F5F5F5',
} as const;

export type ColorKey = keyof typeof Colors;
