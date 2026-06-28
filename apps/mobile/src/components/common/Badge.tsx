// ─────────────────────────────────────────────────────────────
// LastMinute — Common Badge Component
// ─────────────────────────────────────────────────────────────

import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography } from "./Typography";

export type BadgeVariant =
  "critical" | "high" | "medium" | "low" | "success" | "warning" | "error" | "info" | "neutral";

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = "neutral", style }) => {
  return (
    <View style={[styles.badge, variantStyles[variant], style]}>
      <Typography style={[styles.text, textStyles[variant]]}>{label.toUpperCase()}</Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.full,
    alignSelf: "flex-start",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

const variantStyles = StyleSheet.create({
  critical: {
    backgroundColor: colors.priority.criticalBg,
    borderWidth: 1,
    borderColor: colors.priority.critical,
  },
  high: {
    backgroundColor: colors.priority.highBg,
    borderWidth: 1,
    borderColor: colors.priority.high,
  },
  medium: {
    backgroundColor: colors.priority.mediumBg,
    borderWidth: 1,
    borderColor: colors.priority.medium,
  },
  low: { backgroundColor: colors.priority.lowBg, borderWidth: 1, borderColor: colors.priority.low },
  success: {
    backgroundColor: colors.status.successBg,
    borderWidth: 1,
    borderColor: colors.status.success,
  },
  warning: {
    backgroundColor: colors.status.warningBg,
    borderWidth: 1,
    borderColor: colors.status.warning,
  },
  error: {
    backgroundColor: colors.status.errorBg,
    borderWidth: 1,
    borderColor: colors.status.error,
  },
  info: { backgroundColor: colors.status.infoBg, borderWidth: 1, borderColor: colors.status.info },
  neutral: {
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
});

const textStyles = StyleSheet.create({
  critical: { color: colors.priority.critical },
  high: { color: colors.priority.high },
  medium: { color: colors.priority.medium },
  low: { color: colors.text.secondary },
  success: { color: colors.status.success },
  warning: { color: colors.status.warning },
  error: { color: colors.status.error },
  info: { color: colors.status.info },
  neutral: { color: colors.text.secondary },
});
