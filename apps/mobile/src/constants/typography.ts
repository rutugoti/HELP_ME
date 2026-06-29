// ─────────────────────────────────────────────────────────────
// LastMinute — Design System Typography
// ─────────────────────────────────────────────────────────────

import { Platform } from "react-native";
import { moderateScale } from "../utils/responsive";

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
    xs: moderateScale(11),
    sm: moderateScale(13),
    base: moderateScale(15),
    md: moderateScale(17),
    lg: moderateScale(20),
    xl: moderateScale(24),
    xxl: moderateScale(30),
    xxxl: moderateScale(38),
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
