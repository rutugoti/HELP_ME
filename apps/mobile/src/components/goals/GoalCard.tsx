// ─────────────────────────────────────────────────────────────
// LastMinute — Goal Card Component
// ─────────────────────────────────────────────────────────────

import React from "react";
import { StyleSheet, View, TouchableOpacity, DimensionValue } from "react-native";
import { GoalWithProgress } from "@lastminute/types";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography, Card } from "../common";

interface Props {
  goal: GoalWithProgress;
  onPress?: () => void;
}

export const GoalCard: React.FC<Props> = ({ goal, onPress }) => {
  const progressRatio =
    goal.totalMilestones > 0 ? goal.completedMilestones / goal.totalMilestones : 0;

  const progressPercentage = (progressRatio * 100).toFixed(0);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.touchable}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Typography variant="bodyBold" numberOfLines={1} style={styles.title}>
            🎯 {goal.title}
          </Typography>
          <View style={styles.statusBadge}>
            <Typography variant="caption" color={colors.accent.primary} style={styles.statusText}>
              {goal.status.toUpperCase()}
            </Typography>
          </View>
        </View>

        {goal.description ? (
          <Typography
            variant="caption"
            color={colors.text.secondary}
            numberOfLines={2}
            style={styles.desc}
          >
            {goal.description}
          </Typography>
        ) : null}

        <View style={styles.progressRow}>
          <Typography variant="captionMuted">
            Progress ({goal.completedMilestones}/{goal.totalMilestones} milestones)
          </Typography>
          <Typography variant="caption" color={colors.accent.primary} style={{ fontWeight: "700" }}>
            {progressPercentage}%
          </Typography>
        </View>

        <View style={styles.progressBarBg}>
          <View
            style={[styles.progressBarFill, { width: `${progressPercentage}%` as DimensionValue }]}
          />
        </View>

        <View style={styles.footer}>
          <Typography variant="captionMuted">Target: {formatDate(goal.targetDate)}</Typography>

          {goal.projectedCompletionDate ? (
            <Typography variant="caption" color={colors.priority.low} style={styles.projection}>
              🔮 Projection: {formatDate(goal.projectedCompletionDate)}
            </Typography>
          ) : null}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    marginBottom: spacing.sm,
  },
  card: {
    padding: spacing.md,
    borderColor: colors.border.subtle,
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 16,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    backgroundColor: colors.background.primary,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  statusText: {
    fontWeight: "700",
    fontSize: 9,
    letterSpacing: 0.5,
  },
  desc: {
    marginBottom: spacing.md,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xxs,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.background.primary,
    borderRadius: radii.full,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.accent.primary,
    borderRadius: radii.full,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  projection: {
    fontWeight: "600",
  },
});
