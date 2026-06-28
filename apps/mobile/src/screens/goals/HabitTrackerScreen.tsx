// ─────────────────────────────────────────────────────────────
// LastMinute — Habit Tracker Screen
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { GoalsStackParamList } from "../../navigation/types";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Typography, Card } from "../../components/common";
import { HabitRow } from "../../components/goals";
import { useHabits } from "../../hooks/useHabits";

type Props = NativeStackScreenProps<GoalsStackParamList, "HabitTracker">;

export const HabitTrackerScreen: React.FC<Props> = ({ navigation }) => {
  const { habits, isLoadingHabits, habitsError, logHabit, isLoggingHabit } = useHabits();
  const [loggingCategory, setLoggingCategory] = useState<string | null>(null);

  const handleLog = async (category: string, notes?: string, effortRating?: number) => {
    setLoggingCategory(category);
    try {
      await logHabit(category, { notes, effortRating });
    } catch {
      // Ignored or logged
    } finally {
      setLoggingCategory(null);
    }
  };

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
        <Typography variant="h3" style={styles.headerTitle}>
          Habit Tracker
        </Typography>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Typography variant="bodyMuted" style={styles.subtext}>
          Logging completions daily helps your AI agent analyze behavior drift and dynamically
          schedule focus blocks.
        </Typography>

        {isLoadingHabits ? (
          <ActivityIndicator size="large" color={colors.accent.primary} style={styles.spinner} />
        ) : habitsError ? (
          <Card style={styles.errorCard}>
            <Typography variant="caption" color={colors.priority.critical}>
              ⚠️ Failed to load habits.
            </Typography>
          </Card>
        ) : habits.length > 0 ? (
          habits.map((habit, index) => (
            <HabitRow
              key={index}
              habit={habit}
              onLog={(notes, rating) => handleLog(habit.habitCategory, notes, rating)}
              isLogging={isLoggingHabit && loggingCategory === habit.habitCategory}
            />
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Typography variant="bodyMuted" align="center">
              No active habits found. Habits are automatically created when you define long-term
              goals.
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
  },
  container: {
    padding: spacing.lg,
  },
  subtext: {
    marginBottom: spacing.md,
  },
  spinner: {
    marginVertical: spacing.xl,
  },
  errorCard: {
    padding: spacing.md,
    borderColor: colors.priority.critical,
    borderWidth: 1,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: "center",
  },
});
