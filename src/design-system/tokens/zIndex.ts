/**
 * Z-index layering scale.
 * React Native uses `zIndex` on Views — higher values render on top.
 */
export const zIndex = {
  /** Normal document flow */
  base: 0,
  /** Elevated cards, sticky headers */
  raised: 1,
  /** Dropdowns, autocomplete menus */
  dropdown: 100,
  /** Sticky elements (tab bar, app bar) */
  sticky: 200,
  /** Bottom sheets */
  bottomSheet: 300,
  /** Modals, dialogs */
  modal: 400,
  /** Toast notifications */
  toast: 500,
  /** Loader overlays */
  overlay: 600,
} as const;

export type ZIndexKey = keyof typeof zIndex;
