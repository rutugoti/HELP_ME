// ─────────────────────────────────────────────────────────────
// LastMinute — Contextual Insight Component
// ─────────────────────────────────────────────────────────────

import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography } from "../common";

interface Props {
  insightText: string;
  variant?: "warning" | "info" | "success";
}

export const ContextualInsight: React.FC<Props> = ({ insightText, variant = "info" }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return {
          bg: "rgba(245, 158, 11, 0.08)",
          border: colors.priority.high,
          icon: "⚠️",
        };
      case "success":
        return {
          bg: "rgba(16, 185, 129, 0.08)",
          border: "#10b981",
          icon: "✨",
        };
      case "info":
      default:
        return {
          bg: "rgba(99, 102, 241, 0.08)",
          border: colors.accent.primary,
          icon: "🧠",
        };
    }
  };

  const config = getVariantStyles();

  return (
    <View style={[styles.container, { backgroundColor: config.bg, borderColor: config.border }]}>
      <Typography variant="bodyBold" style={styles.icon}>
        {config.icon}
      </Typography>
      <Typography variant="caption" style={styles.text}>
        {insightText}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  icon: {
    fontSize: 16,
  },
  text: {
    flex: 1,
    color: colors.text.primary,
    lineHeight: 16,
    fontWeight: "500",
  },
});
