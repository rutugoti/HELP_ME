// ─────────────────────────────────────────────────────────────
// LastMinute — Priority Score Bar Component
// ─────────────────────────────────────────────────────────────

import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography } from "../common/Typography";

interface Props {
  score: number;
  maxScore?: number;
  showText?: boolean;
}

export const PriorityScoreBar: React.FC<Props> = ({ score, maxScore = 100, showText = true }) => {
  const percentage = Math.min(Math.max((score / maxScore) * 100, 0), 100);

  const getBarColor = () => {
    if (score >= 80) return colors.priority.critical;
    if (score >= 60) return colors.priority.high;
    if (score >= 40) return colors.priority.medium;
    return colors.priority.low;
  };

  return (
    <View style={styles.container}>
      {showText && (
        <View style={styles.labelRow}>
          <Typography variant="captionMuted">Priority Score</Typography>
          <Typography variant="caption" style={{ color: getBarColor(), fontWeight: "700" }}>
            {score}/{maxScore}
          </Typography>
        </View>
      )}
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              backgroundColor: getBarColor(),
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
    marginVertical: spacing.xxs,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xxs,
  },
  track: {
    height: 6,
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radii.full,
  },
});
