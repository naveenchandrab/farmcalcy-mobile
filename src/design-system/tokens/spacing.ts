/**
 * Spacing tokens — 4pt base grid.
 *
 * All values are in density-independent pixels (dp/pt).
 * Use named tokens throughout the app — never hardcode numeric spacing values.
 *
 * Common usage:
 *   padding: spacing[4]   → 16dp (standard screen edge padding)
 *   gap: spacing[2]       → 8dp  (between form fields)
 *   margin: spacing[3]    → 12dp (between list items)
 */
export const spacing = {
  0: 0,
  px: 1,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
} as const;

export type SpacingKey = keyof typeof spacing;

/** Semantic spacing aliases — descriptive names for common layout patterns. */
export const layout = {
  /** Horizontal padding on every screen edge. */
  screenPaddingH: spacing[4],    // 16dp
  /** Vertical padding at top of screen content. */
  screenPaddingV: spacing[4],    // 16dp
  /** Gap between form fields. */
  fieldGap: spacing[3],          // 12dp
  /** Gap between cards in a list. */
  cardGap: spacing[3],           // 12dp
  /** Inner padding for cards. */
  cardPadding: spacing[4],       // 16dp
  /** Gap between section headers and content. */
  sectionGap: spacing[6],        // 24dp
  /** Bottom safe area padding for fixed CTA buttons. */
  ctaBottomPad: spacing[8],      // 32dp
  /** Height of the app bar. */
  appBarHeight: 56,
  /** Height of the bottom tab bar. */
  tabBarHeight: 60,
  /** Height of a standard list item row. */
  listItemHeight: 56,
  /** Height of standard buttons. */
  buttonHeight: 48,
  /** Height of text inputs. */
  inputHeight: 52,
} as const;
