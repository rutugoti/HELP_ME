// ─────────────────────────────────────────────────────────────
// LastMinute — Milestone Row Component
// ─────────────────────────────────────────────────────────────

import React from "react";
import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { GoalMilestone } from "@lastminute/types";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography } from "../common";

interface Props {
  milestone: GoalMilestone;
  onToggle: () => void;
  isToggling?: boolean;
}

export const MilestoneRow: React.FC<Props> = ({ milestone, onToggle, isToggling = false }) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onToggle}
        disabled={isToggling}
        style={styles.checkboxArea}
      >
        {isToggling ? (
          <ActivityIndicator size="small" color={colors.accent.primary} />
        ) : (
          <View style={[styles.checkbox, milestone.isCompleted && styles.checkboxChecked]}>
            {milestone.isCompleted && (
              <Typography variant="bodyBold" color={colors.white} style={styles.checkMark}>
                ✓
              </Typography>
            )}
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.details}>
        <Typography
          variant="body"
          style={[styles.title, milestone.isCompleted && styles.titleCompleted]}
          numberOfLines={2}
        >
          {milestone.title}
        </Typography>

        <Typography variant="captionMuted">
          Due: {formatDate(milestone.dueDate)}
          {milestone.isCompleted &&
            milestone.completedAt &&
            ` • Done ${formatDate(milestone.completedAt)}`}
        </Typography>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  checkboxArea: {
    paddingRight: spacing.sm,
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.border.focus,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.priority.low,
    borderColor: colors.priority.low,
  },
  checkMark: {
    fontSize: 12,
    lineHeight: 14,
  },
  details: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
  },
  titleCompleted: {
    textDecorationLine: "line-through",
    color: colors.text.secondary,
  },
});
