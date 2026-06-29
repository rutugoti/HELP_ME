// ─────────────────────────────────────────────────────────────
// LastMinute — Responsive Scaling Utility
// Provides proportional scaling for width, height, and fonts.
// ─────────────────────────────────────────────────────────────

import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

// Baseline dimensions based on standard screen (e.g. iPhone 11 Pro/12/13/14/15/16 Pro, baseline width ~375)
const BASELINE_WIDTH = 375;
const BASELINE_HEIGHT = 812;

/**
 * Scales sizing horizontally.
 * Best used for margins, paddings, widths.
 */
export const scale = (size: number): number => {
  return (width / BASELINE_WIDTH) * size;
};

/**
 * Scales sizing vertically.
 * Best used for heights, vertical spacing.
 */
export const verticalScale = (size: number): number => {
  return (height / BASELINE_HEIGHT) * size;
};

/**
 * Moderately scales sizing based on scale factor.
 * Best used for font sizes and components where scaling shouldn't be too aggressive.
 * Default factor is 0.5.
 */
export const moderateScale = (size: number, factor = 0.5): number => {
  return size + (scale(size) - size) * factor;
};
