// ─────────────────────────────────────────────────────────────
// LastMinute — Dashboard Screen
// ─────────────────────────────────────────────────────────────

import React, { useEffect } from "react";
import { StyleSheet, View, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Typography, Card } from "../../components/common";
import { TaskCard, TaskCardSkeleton } from "../../components/tasks";
import { useTasks } from "../../hooks/useTasks";
import { usePriorityScores } from "../../hooks/usePriorityScores";
import { DashboardStackParamList } from "../../navigation/types";
import { TaskListItem } from "@lastminute/types";
import { NotificationBell } from "../../components/notifications";

type Props = NativeStackScreenProps<DashboardStackParamList, "Dashboard">;

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { tasks, isLoading, refetch, startTask, completeTask } = useTasks();
  const { activeTasksCount, averageScore, nextCriticalTask } = usePriorityScores();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      refetch();
    });
    return unsubscribe;
  }, [navigation, refetch]);

  // Take top 3 tasks by score
  const topTasks = React.useMemo(() => {
    return [...tasks]
      .filter((t) => t.status !== "completed" && t.status !== "cancelled")
      .slice(0, 3);
  }, [tasks]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeRow}>
          <View style={styles.welcomeSection}>
            <Typography variant="h2">Dashboard</Typography>
            <Typography variant="bodyMuted">Defend your time and stay ahead.</Typography>
          </View>
          <NotificationBell />
        </View>

        {/* Daily Brief Callout */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate("DailyBrief")}
          style={styles.briefCardContainer}
        >
          <Card style={styles.briefCard}>
            <View style={styles.briefInfo}>
              <Typography variant="bodyBold" color={colors.white}>
                ✨ View Your Daily Brief
              </Typography>
              <Typography variant="caption" style={styles.briefText}>
                Get your personalized AI analysis, priority changes, and day protection schedule.
              </Typography>
            </View>
            <Typography variant="body" color={colors.accent.primary} style={styles.arrowIcon}>
              ➔
            </Typography>
          </Card>
        </TouchableOpacity>

        {/* Insights Callout */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate("Insights")}
          style={styles.briefCardContainer}
        >
          <Card style={[styles.briefCard, styles.insightsCard]}>
            <View style={styles.briefInfo}>
              <Typography variant="bodyBold" color={colors.white}>
                📊 View AI Insights & Stats
              </Typography>
              <Typography variant="caption" style={styles.briefText}>
                Analyze your rolling productivity score, optimal focus windows, and category trends.
              </Typography>
            </View>
            <Typography variant="body" color={colors.accent.primary} style={styles.arrowIcon}>
              ➔
            </Typography>
          </Card>
        </TouchableOpacity>

        {/* Metrics Grid */}
        <View style={styles.metricsRow}>
          <Card style={styles.metricCol}>
            <Typography variant="captionMuted">Active Tasks</Typography>
            <Typography variant="h2" color={colors.accent.primary}>
              {activeTasksCount}
            </Typography>
          </Card>
          <Card style={styles.metricCol}>
            <Typography variant="captionMuted">Avg Priority Score</Typography>
            <Typography variant="h2" color={colors.priority.high}>
              {averageScore}/100
            </Typography>
          </Card>
        </View>

        {/* Next Critical Task Section */}
        {nextCriticalTask && (
          <View style={styles.section}>
            <Typography variant="bodyBold" style={styles.sectionTitle}>
              🛡️ Next Critical Deliverable
            </Typography>
            <TaskCard
              task={nextCriticalTask as TaskListItem}
              onPress={() => {
                // Navigate to task detail (will be implemented in navigation types)
                // For now, we can check if it navigates or log
              }}
              onStart={() => startTask(nextCriticalTask.id)}
              onComplete={() => completeTask(nextCriticalTask.id)}
            />
          </View>
        )}

        {/* Top 3 Prioritized Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Typography variant="bodyBold">⚡ Top Priority Scorings</Typography>
            <TouchableOpacity
              onPress={() => navigation.navigate("PriorityList")}
              activeOpacity={0.7}
            >
              <Typography variant="caption" color={colors.accent.primary}>
                View All
              </Typography>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View>
              <TaskCardSkeleton />
              <TaskCardSkeleton />
            </View>
          ) : topTasks.length > 0 ? (
            topTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onPress={() => {}}
                onStart={() => startTask(task.id)}
                onComplete={() => completeTask(task.id)}
              />
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Typography variant="bodyMuted" align="center">
                No active tasks found. Create a new task to get started!
              </Typography>
            </Card>
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
  container: {
    padding: spacing.lg,
  },
  welcomeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  welcomeSection: {
    flex: 1,
  },
  briefCardContainer: {
    marginBottom: spacing.lg,
  },
  briefCard: {
    backgroundColor: colors.background.input,
    borderColor: colors.border.focus,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  insightsCard: {
    borderColor: colors.accent.primary,
  },
  briefInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  briefText: {
    color: colors.text.secondary,
    marginTop: spacing.xxs,
    lineHeight: 16,
  },
  arrowIcon: {
    fontSize: 20,
    fontWeight: "bold",
  },
  metricsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  metricCol: {
    flex: 1,
    padding: spacing.md,
    alignItems: "center",
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
});
