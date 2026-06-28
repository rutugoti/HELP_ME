// ─────────────────────────────────────────────────────────────
// LastMinute — Task Card Component
// ─────────────────────────────────────────────────────────────

import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  GestureResponderEvent,
} from "react-native";
import { TaskListItem, TaskStatus } from "@lastminute/types";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Typography, Card, Button } from "../common";
import { PriorityBadge } from "./PriorityBadge";
import { PriorityScoreBar } from "./PriorityScoreBar";
import { DeadlineCountdown } from "./DeadlineCountdown";
import { CategoryTag } from "./CategoryTag";
import { ConsequenceIndicator } from "./ConsequenceIndicator";

interface Props {
  task: TaskListItem;
  onPress?: () => void;
  onStart?: () => Promise<boolean>;
  onComplete?: () => Promise<boolean>;
}

export const TaskCard: React.FC<Props> = ({ task, onPress, onStart, onComplete }) => {
  const [isMutating, setIsMutating] = React.useState(false);

  const handleStart = async (e: GestureResponderEvent) => {
    e.stopPropagation();
    if (!onStart) return;
    setIsMutating(true);
    await onStart();
    setIsMutating(false);
  };

  const handleComplete = async (e: GestureResponderEvent) => {
    e.stopPropagation();
    if (!onComplete) return;
    setIsMutating(true);
    await onComplete();
    setIsMutating(false);
  };

  const isCompleted = task.status === TaskStatus.Completed;
  const isInProgress = task.status === TaskStatus.InProgress;

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={isMutating}>
      <Card style={[styles.card, isCompleted && styles.completedCard]}>
        <View style={styles.header}>
          <View style={styles.tagsRow}>
            <PriorityBadge tier={task.priorityTier} />
            <CategoryTag category={task.category} />
          </View>
          <DeadlineCountdown deadline={task.deadline} />
        </View>

        <View style={styles.body}>
          <Typography
            variant="bodyBold"
            style={[styles.title, isCompleted && styles.completedTitle]}
            numberOfLines={2}
          >
            {task.title}
          </Typography>
          {task.description && (
            <Typography
              variant="caption"
              color={colors.text.secondary}
              numberOfLines={2}
              style={styles.desc}
            >
              {task.description}
            </Typography>
          )}
        </View>

        <View style={styles.metricsRow}>
          <ConsequenceIndicator severity={task.consequenceSeverity} />
          {task.estimatedMinutes && (
            <Typography variant="captionMuted">⏱️ {task.estimatedMinutes}m</Typography>
          )}
        </View>

        <PriorityScoreBar score={task.priorityScore} />

        <View style={styles.actions}>
          {isMutating ? (
            <ActivityIndicator size="small" color={colors.accent.primary} />
          ) : (
            <>
              {!isCompleted && !isInProgress && onStart && (
                <Button
                  variant="outline"
                  title="Start Task"
                  onPress={handleStart}
                  style={styles.actionButton}
                />
              )}
              {isInProgress && onComplete && (
                <Button
                  variant="primary"
                  title="Complete"
                  onPress={handleComplete}
                  style={styles.actionButton}
                />
              )}
              {isCompleted && (
                <Typography
                  variant="caption"
                  color={colors.priority.low}
                  style={styles.completedBadge}
                >
                  ✓ Completed
                </Typography>
              )}
            </>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  completedCard: {
    opacity: 0.65,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  tagsRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  body: {
    marginBottom: spacing.sm,
  },
  title: {
    marginBottom: spacing.xxs,
  },
  completedTitle: {
    textDecorationLine: "line-through",
    color: colors.text.secondary,
  },
  desc: {
    marginTop: spacing.xxs,
    lineHeight: 15,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: spacing.sm,
    height: 32,
  },
  actionButton: {
    height: 32,
    paddingHorizontal: spacing.md,
  },
  completedBadge: {
    fontWeight: "700",
  },
});
