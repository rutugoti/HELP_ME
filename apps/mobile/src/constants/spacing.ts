// ─────────────────────────────────────────────────────────────
// LastMinute — Design System Spacing
// 4px base unit scale. All layout spacing flows from here.
// ─────────────────────────────────────────────────────────────

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  "6xl": 64,
  "7xl": 80,
} as const;

export const radii = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  full: 9999,
} as const;

export const screenPadding = {
  horizontal: spacing.lg,
  vertical: spacing.xl,
} as const;

export type SpacingToken = typeof spacing;
export type RadiiToken = typeof radii;
