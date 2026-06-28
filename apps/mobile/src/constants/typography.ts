// ─────────────────────────────────────────────────────────────
// LastMinute — Design System Typography
// ─────────────────────────────────────────────────────────────

import { Platform } from "react-native";

export const typography = {
  fontFamily: {
    sans: Platform.select({
      ios: "System",
      android: "sans-serif",
      default: "sans-serif",
    }),
    mono: Platform.select({
      ios: "Courier New",
      android: "monospace",
      default: "monospace",
    }),
  },

  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 30,
    xxxl: 38,
  },

  fontWeight: {
    thin: "100" as const,
    light: "300" as const,
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    heavy: "900" as const,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },

  letterSpacing: {
    tighter: -0.5,
    normal: 0,
    wider: 0.5,
    widest: 1.0,
  },
} as const;

export type TypographyToken = typeof typography;
export type FontSizeKey = keyof typeof typography.fontSize;
export type FontWeightKey = keyof typeof typography.fontWeight;
