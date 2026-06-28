// ─────────────────────────────────────────────────────────────
// LastMinute — Score Breakdown Component
// ─────────────────────────────────────────────────────────────

import React from "react";
import { StyleSheet, View } from "react-native";
import { ScoreComponents } from "@lastminute/types";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography } from "../common";

interface Props {
  components: ScoreComponents;
}

export const ScoreBreakdown: React.FC<Props> = ({ components }) => {
  const renderItem = (label: string, value: number, color: string, description: string) => {
    const percentage = Math.min(Math.max(value, 0), 100);

    return (
      <View style={styles.itemContainer}>
        <View style={styles.headerRow}>
          <Typography variant="bodyBold" style={styles.label}>
            {label}
          </Typography>
          <Typography variant="bodyBold" style={{ color }}>
            {value.toFixed(0)} pts
          </Typography>
        </View>
        <Typography variant="captionMuted" style={styles.desc}>
          {description}
        </Typography>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Typography variant="bodyBold" style={styles.title}>
        Score Contribution Breakdown
      </Typography>

      {renderItem(
        "⏳ Deadline Proximity",
        components.deadlineProximity,
        colors.priority.high,
        "Based on time remaining vs. estimated effort."
      )}

      {renderItem(
        "🔗 Dependency Impact",
        components.dependencyImpact,
        colors.accent.primary,
        "Based on number of downstream tasks/people blocked."
      )}

      {renderItem(
        "💥 Consequence Severity",
        components.consequenceSeverity,
        colors.priority.critical,
        "Derived from task category and role profile defaults."
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    marginVertical: spacing.sm,
  },
  title: {
    marginBottom: spacing.xxs,
  },
  itemContainer: {
    gap: spacing.xxs,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 13,
  },
  desc: {
    fontSize: 11,
    lineHeight: 14,
  },
  track: {
    height: 4,
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.full,
    overflow: "hidden",
    marginTop: spacing.xxs,
  },
  fill: {
    height: "100%",
    borderRadius: radii.full,
  },
});
