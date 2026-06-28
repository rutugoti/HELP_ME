// ─────────────────────────────────────────────────────────────
// LastMinute — Priority Badge Component
// ─────────────────────────────────────────────────────────────

import React from "react";
import { StyleSheet, View, StyleProp, ViewStyle } from "react-native";
import { PriorityTier } from "@lastminute/types";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography } from "../common/Typography";

interface Props {
  tier: PriorityTier;
  style?: StyleProp<ViewStyle>;
}

export const PriorityBadge: React.FC<Props> = ({ tier, style }) => {
  const getBadgeColors = () => {
    switch (tier) {
      case PriorityTier.Critical:
        return { bg: colors.priority.critical, text: colors.white };
      case PriorityTier.High:
        return { bg: colors.priority.high, text: colors.white };
      case PriorityTier.Medium:
        return { bg: colors.priority.medium, text: colors.text.primary };
      case PriorityTier.Low:
        return { bg: colors.priority.low, text: colors.text.secondary };
      default:
        return { bg: colors.background.tertiary, text: colors.text.secondary };
    }
  };

  const config = getBadgeColors();

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, style]}>
      <Typography variant="caption" style={[styles.text, { color: config.text }]}>
        {tier.toUpperCase()}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.sm,
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
