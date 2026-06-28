// ─────────────────────────────────────────────────────────────
// LastMinute — Task Dependency Screen
// ─────────────────────────────────────────────────────────────

import React from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { TasksStackParamList } from "../../navigation/types";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Typography, Card } from "../../components/common";
import { DependencyGraph } from "../../components/tasks";
import { tasksApi } from "@lastminute/api-client";
import { api } from "../../services/api";

type Props = NativeStackScreenProps<TasksStackParamList, "TaskDependency">;

export const TaskDependencyScreen: React.FC<Props> = ({ route, navigation }) => {
  const { taskId } = route.params;

  const { data: taskRes, isLoading: isTaskLoading } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => tasksApi.getTask(api, taskId),
  });

  const { data: depRes, isLoading: isDepLoading } = useQuery({
    queryKey: ["taskDependencies", taskId],
    queryFn: () => tasksApi.getTaskDependencies(api, taskId),
  });

  const task = taskRes?.status === "success" ? taskRes.data : null;
  const graph = depRes?.status === "success" ? depRes.data : null;

  const isLoading = isTaskLoading || isDepLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
        </View>
      </SafeAreaView>
    );
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
          Task Relationships
        </Typography>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {task && (
          <View style={styles.taskSummary}>
            <Typography variant="caption" color={colors.accent.primary} style={styles.categoryText}>
              {task.category.toUpperCase()}
            </Typography>
            <Typography variant="h3" style={styles.taskTitle}>
              {task.title}
            </Typography>
          </View>
        )}

        {graph ? (
          <DependencyGraph graph={graph} />
        ) : (
          <Card style={styles.errorCard}>
            <Typography variant="bodyMuted" align="center">
              Failed to load dependency graph.
            </Typography>
          </Card>
        )}

        <View style={styles.infoBox}>
          <Typography variant="caption" color={colors.text.secondary} style={styles.infoText}>
            ℹ️ Downstream blocker counts directly increase a task's Priority Score, moving it higher
            in the stack. Complete blocking tasks first to open up dependent streams.
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    marginRight: spacing.lg, // offset for alignment
  },
  container: {
    padding: spacing.lg,
  },
  taskSummary: {
    marginBottom: spacing.lg,
  },
  categoryText: {
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  taskTitle: {
    marginTop: spacing.xxs,
  },
  errorCard: {
    padding: spacing.xl,
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
