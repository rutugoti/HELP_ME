// ─────────────────────────────────────────────────────────────
// LastMinute — Common ProgressBar Component
// ─────────────────────────────────────────────────────────────

import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Typography } from "./Typography";

export interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
  showPercentage?: boolean;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = colors.accent.primary,
  height = 8,
  showPercentage = false,
  style,
}) => {
  const clampedProgress = Math.min(Math.max(0, progress), 1);
  const percentage = Math.round(clampedProgress * 100);

  return (
    <View style={[styles.container, style]}>
      {showPercentage && (
        <View style={styles.header}>
          <Typography variant="caption" style={styles.label}>
            Progress
          </Typography>
          <Typography variant="caption" style={styles.percentage}>
            {percentage}%
          </Typography>
        </View>
      )}
      <View style={[styles.track, { height, borderRadius: height / 2 }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              backgroundColor: color,
              height,
              borderRadius: height / 2,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: spacing.xs,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  label: {
    color: colors.text.secondary,
    fontWeight: "500",
  },
  percentage: {
    color: colors.text.primary,
    fontWeight: "600",
  },
  track: {
    width: "100%",
    backgroundColor: colors.background.tertiary,
    overflow: "hidden",
  },
  fill: {
    width: 0,
  },
});
