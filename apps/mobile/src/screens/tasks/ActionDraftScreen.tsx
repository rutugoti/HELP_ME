// ─────────────────────────────────────────────────────────────
// LastMinute — Action Draft Screen
// ─────────────────────────────────────────────────────────────

import React from "react";
import { StyleSheet, View, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { TasksStackParamList } from "../../navigation/types";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Typography, Card, Button } from "../../components/common";
import { ActionDraftCard, AILoadingState } from "../../components/tasks";
import { useActionDraft } from "../../hooks/useActionDraft";
import { tasksApi } from "@lastminute/api-client";
import { api } from "../../services/api";

type Props = NativeStackScreenProps<TasksStackParamList, "ActionDraft">;

export const ActionDraftScreen: React.FC<Props> = ({ route, navigation }) => {
  const { taskId } = route.params;
  const { draft, isGenerating, submitFeedback, isSubmittingFeedback, refetch } =
    useActionDraft(taskId);

  const { data: taskRes } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => tasksApi.getTask(api, taskId),
  });

  const task = taskRes?.status === "success" ? taskRes.data : null;

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
          AI Action Draft
        </Typography>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {task && (
          <View style={styles.taskHeader}>
            <Typography variant="caption" color={colors.text.secondary}>
              ACTION FOR TASK:
            </Typography>
            <Typography variant="h3" style={styles.taskTitle}>
              {task.title}
            </Typography>
          </View>
        )}

        {isGenerating ? (
          <AILoadingState />
        ) : draft ? (
          <ActionDraftCard
            draft={draft}
            onSubmitFeedback={submitFeedback}
            isSubmittingFeedback={isSubmittingFeedback}
          />
        ) : (
          <Card style={styles.emptyCard}>
            <Typography variant="bodyMuted" align="center" style={styles.emptyText}>
              No active draft found or generation was cancelled.
            </Typography>
            <Button variant="primary" title="Generate New Draft" onPress={() => refetch()} />
          </Card>
        )}

        <View style={styles.infoBox}>
          <Typography variant="caption" color={colors.text.secondary} style={styles.infoText}>
            💡 **About Action Drafts**: When a task's priority spikes and risks breaching a
            boundary, the Context Engine automatically draft templates (e.g., notification emails,
            request scripts, or focus breakdowns) to help you immediately execute work or
            proactively renegotiate with stakeholders.
          </Typography>
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
    marginRight: spacing.lg,
  },
  container: {
    padding: spacing.lg,
  },
  taskHeader: {
    marginBottom: spacing.lg,
  },
  taskTitle: {
    marginTop: spacing.xxs,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
  },
  emptyText: {
    marginBottom: spacing.xs,
  },
  infoBox: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: spacing.xs,
  },
  infoText: {
    lineHeight: 16,
  },
});
