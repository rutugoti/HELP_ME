// ─────────────────────────────────────────────────────────────
// LastMinute — Goals Screen
// ─────────────────────────────────────────────────────────────

import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { GoalsStackParamList } from "../../navigation/types";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography, Card, Button } from "../../components/common";
import { GoalCard } from "../../components/goals";
import { useGoals } from "../../hooks/useGoals";
import { useHabits } from "../../hooks/useHabits";

type Props = NativeStackScreenProps<GoalsStackParamList, "GoalsMain">;

export const GoalsScreen: React.FC<Props> = ({ navigation }) => {
  const { goals, isLoadingGoals, goalsError, refetchGoals } = useGoals();
  const { habits, isLoadingHabits } = useHabits();

  const handleRefresh = async () => {
    await Promise.all([refetchGoals()]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Typography variant="h2">Goals & Habits</Typography>
        <Button
          variant="primary"
          size="sm"
          title="+ New Goal"
          onPress={() => navigation.navigate("GoalCreate")}
          style={styles.newGoalBtn}
        />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Habits Overview Panel */}
        <Typography variant="bodyBold" style={styles.sectionTitle}>
          Habit Tracking Summary
        </Typography>

        {isLoadingHabits ? (
          <ActivityIndicator size="small" color={colors.accent.primary} style={styles.spinner} />
        ) : habits.length > 0 ? (
          <Card style={styles.habitsSummaryCard}>
            <View style={styles.habitsSummaryHeader}>
              <Typography variant="bodyBold">Active Habits ({habits.length})</Typography>
              <Button
                variant="ghost"
                size="sm"
                title="Manage Tracker"
                onPress={() => navigation.navigate("HabitTracker")}
              />
            </View>

            <View style={styles.habitsGrid}>
              {habits.slice(0, 3).map((h, i) => (
                <View key={i} style={styles.habitBadge}>
                  <Typography variant="caption" style={styles.habitBadgeText}>
                    ⚡ {h.habitCategory}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={colors.accent.primary}
                    style={{ fontWeight: "700" }}
                  >
                    🔥 {h.currentStreak}d
                  </Typography>
                </View>
              ))}
            </View>
          </Card>
        ) : (
          <Card style={styles.emptyHabitsCard}>
            <Typography variant="bodyMuted" align="center" style={{ marginBottom: spacing.xs }}>
              No habits logged. Habits are auto-generated when you create goals!
            </Typography>
            <Button
              variant="outline"
              size="sm"
              title="Open Tracker"
              onPress={() => navigation.navigate("HabitTracker")}
              style={styles.openTrackerBtn}
            />
          </Card>
        )}

        {/* Goals List */}
        <View style={styles.goalsHeader}>
          <Typography variant="bodyBold" style={styles.sectionTitle}>
            Long-Horizon Goals
          </Typography>
          <TouchableOpacity onPress={handleRefresh} activeOpacity={0.7}>
            <Typography variant="caption" color={colors.accent.primary}>
              Refresh
            </Typography>
          </TouchableOpacity>
        </View>

        {isLoadingGoals ? (
          <ActivityIndicator size="large" color={colors.accent.primary} style={styles.spinner} />
        ) : goalsError ? (
          <Card style={styles.errorCard}>
            <Typography variant="caption" color={colors.priority.critical}>
              ⚠️ Failed to load goals: {goalsError.message}
            </Typography>
          </Card>
        ) : goals.length > 0 ? (
          goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onPress={() =>
                navigation.navigate("GoalDetail", { goalId: goal.id, title: goal.title })
              }
            />
          ))
        ) : (
          <Card style={styles.emptyGoalsCard}>
            <Typography variant="bodyMuted" align="center" style={{ marginBottom: spacing.sm }}>
              You don't have any active goals yet. Define a target to auto-generate weekly
              milestones.
            </Typography>
            <Button
              variant="primary"
              title="Define First Goal"
              onPress={() => navigation.navigate("GoalCreate")}
              style={{ alignSelf: "center", width: 200 }}
            />
          </Card>
        )}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  newGoalBtn: {
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: 15,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  spinner: {
    marginVertical: spacing.lg,
  },
  habitsSummaryCard: {
    padding: spacing.md,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  habitsSummaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  habitsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  habitBadge: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.background.primary,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    flex: 1,
    minWidth: 100,
  },
  habitBadgeText: {
    textTransform: "capitalize",
  },
  emptyHabitsCard: {
    padding: spacing.md,
    alignItems: "center",
    borderColor: colors.border.subtle,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  openTrackerBtn: {
    width: 140,
  },
  goalsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  errorCard: {
    borderColor: colors.priority.critical,
    borderWidth: 1,
    padding: spacing.md,
  },
  emptyGoalsCard: {
    padding: spacing.xl,
    justifyContent: "center",
    borderColor: colors.border.subtle,
    borderWidth: 1,
  },
});
