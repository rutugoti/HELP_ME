// ─────────────────────────────────────────────────────────────
// LastMinute — Task Detail Screen
// ─────────────────────────────────────────────────────────────

import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TasksStackParamList } from "../../navigation/types";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography, Card, Button } from "../../components/common";
import {
  PriorityBadge,
  PriorityScoreBar,
  ScoreBreakdown,
  ContextualInsight,
} from "../../components/tasks";
import { tasksApi } from "@lastminute/api-client";
import { api } from "../../services/api";
import { TaskStatus } from "@lastminute/types";

type Props = NativeStackScreenProps<TasksStackParamList, "TaskDetail">;

export const TaskDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { taskId } = route.params;
  const queryClient = useQueryClient();

  // Query full task detail (we can query task details and we also get scores in list, but let's query detail)
  const { data: taskRes, isLoading } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => tasksApi.getTask(api, taskId),
  });

  // Query list tasks to grab score breakdown since listTasks returns TaskListItem (enriched)
  const { data: tasksListRes } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => tasksApi.listTasks(api),
  });

  const task = taskRes?.status === "success" ? taskRes.data : null;
  const taskListItem =
    tasksListRes?.status === "success" ? tasksListRes.data.find((t) => t.id === taskId) : null;

  const startMutation = useMutation({
    mutationFn: () => tasksApi.startTask(api, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => tasksApi.completeTask(api, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Typography variant="bodyBold" color={colors.priority.critical}>
            Task not found.
          </Typography>
          <Button
            variant="outline"
            title="Back"
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  const isCompleted = task.status === TaskStatus.Completed;
  const isInProgress = task.status === TaskStatus.InProgress;

  // Derive insight text
  let insightText =
    "This task is currently unscheduled. Start progress to lock in your focus window.";
  let insightVariant: "info" | "warning" | "success" = "info";

  const now = Date.now();
  const deadlineTime = new Date(task.deadline).getTime();
  if (deadlineTime < now && !isCompleted) {
    insightText =
      "CRITICAL: This task is overdue! Complete it immediately to minimize negative impacts.";
    insightVariant = "warning";
  } else if (deadlineTime - now < 3 * 60 * 60 * 1000 && !isCompleted) {
    insightText =
      "URGENT: Less than 3 hours remaining before target deadline. Consider generating an AI Action Draft.";
    insightVariant = "warning";
  } else if (isCompleted) {
    insightText = "Great job! This task was completed successfully. Your calendar sync is updated.";
    insightVariant = "success";
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backLink}
        >
          <Typography variant="bodyBold" color={colors.text.secondary}>
            ➔ Back
          </Typography>
        </TouchableOpacity>
        <Typography variant="h3" style={styles.headerTitle}>
          Details
        </Typography>
        <TouchableOpacity
          onPress={() => navigation.navigate("TaskEdit", { taskId })}
          activeOpacity={0.7}
        >
          <Typography variant="bodyBold" color={colors.accent.primary}>
            Edit
          </Typography>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.metaRow}>
          {taskListItem && <PriorityBadge tier={taskListItem.priorityTier} />}
          <Typography variant="caption" style={styles.categoryBadge}>
            {task.category}
          </Typography>
        </View>

        <Typography variant="h2" style={styles.title}>
          {task.title}
        </Typography>

        {task.description && (
          <Card style={styles.descCard}>
            <Typography variant="body" color={colors.text.secondary}>
              {task.description}
            </Typography>
          </Card>
        )}

        <View style={styles.datesGrid}>
          <View style={styles.dateCol}>
            <Typography variant="captionMuted">Deadline</Typography>
            <Typography variant="body" style={styles.dateValue}>
              {new Date(task.deadline).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
          </View>
          {task.estimatedMinutes && (
            <View style={styles.dateCol}>
              <Typography variant="captionMuted">Est Effort</Typography>
              <Typography variant="body" style={styles.dateValue}>
                ⏱️ {task.estimatedMinutes} mins
              </Typography>
            </View>
          )}
        </View>

        <ContextualInsight insightText={insightText} variant={insightVariant} />

        {/* Priority Score Breakdown if loaded */}
        {taskListItem && (
          <Card style={styles.scoreCard}>
            <PriorityScoreBar score={taskListItem.priorityScore} />
            <View style={styles.spacer} />
            <ScoreBreakdown components={taskListItem.scoreComponents} />
          </Card>
        )}

        {/* Action Draft and Dependencies buttons */}
        <View style={styles.navRow}>
          <Button
            variant="outline"
            title="🔗 Dependencies"
            onPress={() => navigation.navigate("TaskDependency", { taskId })}
            style={styles.navBtn}
          />
          <Button
            variant="outline"
            title="🤖 AI Action Draft"
            onPress={() => navigation.navigate("ActionDraft", { taskId })}
            style={styles.navBtn}
          />
        </View>

        {/* CTA Actions */}
        <View style={styles.actions}>
          {!isCompleted && !isInProgress && (
            <Button
              variant="primary"
              title="Start Work"
              onPress={() => startMutation.mutate()}
              disabled={startMutation.isPending}
              style={styles.ctaBtn}
            />
          )}
          {isInProgress && (
            <Button
              variant="primary"
              title="Mark Complete"
              onPress={() => completeMutation.mutate()}
              disabled={completeMutation.isPending}
              style={styles.ctaBtn}
            />
          )}
          {isCompleted && (
            <Typography
              variant="bodyBold"
              color={colors.priority.low}
              style={styles.completedBanner}
            >
              ✓ Completed
            </Typography>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  backBtn: {
    marginTop: spacing.md,
    width: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  backLink: {
    transform: [{ rotate: "180deg" }],
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },
  container: {
    padding: spacing.lg,
  },
  metaRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
    backgroundColor: colors.background.secondary,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    fontSize: 10,
    fontWeight: "700",
    color: colors.text.secondary,
    textTransform: "uppercase",
  },
  title: {
    marginBottom: spacing.md,
  },
  descCard: {
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    marginBottom: spacing.md,
  },
  datesGrid: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  dateCol: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  dateValue: {
    marginTop: spacing.xxs,
    fontWeight: "600",
  },
  scoreCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  spacer: {
    height: spacing.sm,
  },
  navRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  navBtn: {
    flex: 1,
  },
  actions: {
    marginTop: spacing.sm,
    alignItems: "center",
  },
  ctaBtn: {
    width: "100%",
  },
  completedBanner: {
    fontSize: 16,
    fontWeight: "700",
  },
});
