// ─────────────────────────────────────────────────────────────
// LastMinute — Goal Detail Screen
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  DimensionValue,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { GoalsStackParamList } from "../../navigation/types";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography, Card, Button } from "../../components/common";
import { MilestoneRow } from "../../components/goals";
import { useGoals } from "../../hooks/useGoals";
import { GoalMilestone } from "@lastminute/types";

type Props = NativeStackScreenProps<GoalsStackParamList, "GoalDetail">;

export const GoalDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { goalId } = route.params;
  const { goals, toggleMilestone, deleteGoal, isDeletingGoal } = useGoals();

  const [togglingMilestoneId, setTogglingMilestoneId] = useState<string | null>(null);

  // Find goal in memory first to display immediately
  const goal = goals.find((g) => g.id === goalId);

  // Since we imported hooks that have getMilestones, let's call getMilestones helper in our query:
  const { getMilestones } = useGoals();
  const {
    data: queryMilestones = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["goalMilestones", goalId],
    queryFn: () => getMilestones(goalId),
  });

  const handleToggleMilestone = async (m: GoalMilestone) => {
    setTogglingMilestoneId(m.id);
    try {
      await toggleMilestone(m.id, !m.isCompleted);
    } catch {
      // Handled silently
    } finally {
      setTogglingMilestoneId(null);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Goal",
      "Are you sure you want to delete this goal and all associated milestones? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGoal(goalId);
              navigation.navigate("GoalsMain");
            } catch {
              // Handled
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!goal) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Typography variant="body">Goal not found.</Typography>
          <Button variant="outline" title="Back to Goals" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const progressRatio =
    goal.totalMilestones > 0 ? goal.completedMilestones / goal.totalMilestones : 0;
  const progressPercentage = (progressRatio * 100).toFixed(0);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
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
        <Typography variant="h3" numberOfLines={1} style={styles.headerTitle}>
          Goal Details
        </Typography>
        <TouchableOpacity onPress={handleDelete} disabled={isDeletingGoal} activeOpacity={0.7}>
          <Typography variant="bodyBold" color={colors.priority.critical}>
            Delete
          </Typography>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Goal Card Header */}
        <Card style={styles.goalInfoCard}>
          <Typography variant="h2" style={styles.goalTitle}>
            🎯 {goal.title}
          </Typography>

          {goal.description ? (
            <Typography variant="body" color={colors.text.secondary} style={styles.goalDesc}>
              {goal.description}
            </Typography>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View>
              <Typography variant="captionMuted">TARGET DATE</Typography>
              <Typography variant="bodyBold">{formatDate(goal.targetDate)}</Typography>
            </View>

            {goal.projectedCompletionDate ? (
              <View style={styles.alignRight}>
                <Typography variant="captionMuted">PROJECTED COMPLETION</Typography>
                <Typography variant="bodyBold" color={colors.priority.low}>
                  🔮 {formatDate(goal.projectedCompletionDate)}
                </Typography>
              </View>
            ) : null}
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressTextRow}>
              <Typography variant="captionMuted">Overall Progress</Typography>
              <Typography variant="bodyBold" color={colors.accent.primary}>
                {progressPercentage}%
              </Typography>
            </View>
            <View style={styles.progressBg}>
              <View
                style={[styles.progressFill, { width: `${progressPercentage}%` as DimensionValue }]}
              />
            </View>
          </View>
        </Card>

        {/* Milestones list */}
        <Typography variant="bodyBold" style={styles.sectionTitle}>
          Weekly Milestones
        </Typography>

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.accent.primary} style={styles.spinner} />
        ) : error ? (
          <Card style={styles.errorCard}>
            <Typography variant="caption" color={colors.priority.critical}>
              ⚠️ Failed to load milestones.
            </Typography>
          </Card>
        ) : queryMilestones.length > 0 ? (
          <Card style={styles.milestonesCard}>
            {queryMilestones.map((m: GoalMilestone) => (
              <MilestoneRow
                key={m.id}
                milestone={m}
                onToggle={() => handleToggleMilestone(m)}
                isToggling={togglingMilestoneId === m.id}
              />
            ))}
          </Card>
        ) : (
          <Card style={styles.emptyCard}>
            <Typography variant="bodyMuted" align="center">
              No milestones generated for this goal.
            </Typography>
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
    alignItems: "center",
    justifyContent: "space-between",
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
    marginHorizontal: spacing.md,
  },
  container: {
    padding: spacing.lg,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  goalInfoCard: {
    padding: spacing.md,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  goalTitle: {
    marginBottom: spacing.xs,
  },
  goalDesc: {
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginVertical: spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  alignRight: {
    alignItems: "flex-end",
  },
  progressSection: {
    marginTop: spacing.xs,
  },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  progressBg: {
    height: 8,
    backgroundColor: colors.background.primary,
    borderRadius: radii.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.accent.primary,
    borderRadius: radii.full,
  },
  sectionTitle: {
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  spinner: {
    marginVertical: spacing.xl,
  },
  errorCard: {
    padding: spacing.md,
    borderColor: colors.priority.critical,
    borderWidth: 1,
  },
  milestonesCard: {
    paddingHorizontal: spacing.md,
    paddingVertical: 0,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  emptyCard: {
    padding: spacing.lg,
    alignItems: "center",
  },
});
