// ─────────────────────────────────────────────────────────────
// LastMinute — Focus Block Booking Screen
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CalendarStackParamList } from "../../navigation/types";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography, Card, Button } from "../../components/common";
import { useCalendar } from "../../hooks/useCalendar";
import { useTasks } from "../../hooks/useTasks";
import { TaskStatus } from "@lastminute/types";

type Props = NativeStackScreenProps<CalendarStackParamList, "FocusBlock">;

export const FocusBlockScreen: React.FC<Props> = ({ route, navigation }) => {
  const { startsAt, endsAt, durationMinutes } = route.params;

  const { createFocusBlock, isCreatingFocusBlock } = useCalendar();
  const { tasks, isLoading: isLoadingTasks } = useTasks();

  // Filter tasks to only show active ones (Open or In Progress)
  const activeTasks = tasks.filter(
    (t) => t.status === TaskStatus.Open || t.status === TaskStatus.InProgress
  );

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [preferredDuration, setPreferredDuration] = useState<number>(Math.min(durationMinutes, 60));
  const [allowAutonomous, setAllowAutonomous] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleBook = async () => {
    if (!selectedTaskId) {
      setErrorText("Please select a task to focus on.");
      return;
    }
    setErrorText(null);

    try {
      await createFocusBlock({
        taskId: selectedTaskId,
        preferredDuration,
        latestStartBy: startsAt,
        allowAutonomousBooking: allowAutonomous,
      });
      navigation.navigate("CalendarMain");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to book focus block.";
      setErrorText(errorMessage);
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backLink}
        >
          <Typography style={styles.backText}>←</Typography>
        </TouchableOpacity>
        <Typography variant="h3" style={styles.headerTitle}>
          Book Focus Block
        </Typography>
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {errorText && (
          <Card style={styles.errorCard}>
            <Typography variant="caption" color={colors.priority.critical}>
              ⚠️ {errorText}
            </Typography>
          </Card>
        )}

        {/* Slot details */}
        <Card style={styles.slotCard}>
          <Typography variant="caption" color={colors.accent.primary} style={styles.slotSub}>
            SELECTED TIME WINDOW
          </Typography>
          <Typography variant="h3" style={styles.slotTime}>
            {formatTime(startsAt)} - {formatTime(endsAt)}
          </Typography>
          <Typography variant="captionMuted">Total slot size: {durationMinutes} minutes</Typography>
        </Card>

        {/* Task Selection */}
        <Typography variant="bodyBold" style={styles.label}>
          Select Task
        </Typography>

        {isLoadingTasks ? (
          <ActivityIndicator size="small" color={colors.accent.primary} style={styles.spinner} />
        ) : activeTasks.length > 0 ? (
          <View style={styles.tasksList}>
            {activeTasks.map((t) => {
              const isSelected = selectedTaskId === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  activeOpacity={0.7}
                  onPress={() => setSelectedTaskId(t.id)}
                  style={[styles.taskRow, isSelected && styles.taskRowSelected]}
                >
                  <Typography variant="bodyBold" style={isSelected && styles.textSelected}>
                    {t.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={isSelected ? colors.white : colors.text.secondary}
                  >
                    Score: {t.priorityScore.toFixed(0)} • {t.category}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <Card style={styles.emptyTasksCard}>
            <Typography variant="bodyMuted" align="center">
              No active tasks found. Go to Tasks tab to create one.
            </Typography>
          </Card>
        )}

        {/* Duration configuration */}
        <Typography variant="bodyBold" style={styles.label}>
          Focus Duration
        </Typography>
        <View style={styles.durationRow}>
          {[30, 45, 60, 90, 120].map((dur) => {
            const isSelected = preferredDuration === dur;
            const isDisabled = dur > durationMinutes;
            return (
              <Button
                key={dur}
                variant={isSelected ? "primary" : "outline"}
                title={`${dur}m`}
                onPress={() => setPreferredDuration(dur)}
                disabled={isDisabled}
                style={styles.durBtn}
              />
            );
          })}
        </View>

        {/* Autonomous Booking Switch */}
        <Typography variant="bodyBold" style={styles.label}>
          Booking Policy
        </Typography>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setAllowAutonomous(!allowAutonomous)}
          style={styles.switchRow}
        >
          <Typography variant="body">Allow autonomous reschedule</Typography>
          <View style={[styles.toggle, allowAutonomous ? styles.toggleOn : styles.toggleOff]}>
            <Typography variant="caption" color={colors.white} style={styles.toggleText}>
              {allowAutonomous ? "ON" : "OFF"}
            </Typography>
          </View>
        </TouchableOpacity>

        <Button
          variant="primary"
          title="Confirm focus block"
          onPress={handleBook}
          isLoading={isCreatingFocusBlock}
          style={styles.bookActionBtn}
        />
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
    padding: spacing.xs,
  },
  backText: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.secondary,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    marginRight: spacing.lg,
  },
  container: {
    padding: spacing.lg,
  },
  errorCard: {
    borderColor: colors.priority.critical,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  slotCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderColor: colors.border.focus,
    borderWidth: 1,
  },
  slotSub: {
    fontWeight: "700",
    fontSize: 10,
    letterSpacing: 0.8,
  },
  slotTime: {
    marginVertical: spacing.xxs,
  },
  label: {
    fontSize: 14,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  spinner: {
    marginVertical: spacing.md,
  },
  tasksList: {
    gap: spacing.xs,
  },
  taskRow: {
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.md,
    gap: spacing.xxs,
  },
  taskRowSelected: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  textSelected: {
    color: colors.white,
  },
  emptyTasksCard: {
    padding: spacing.md,
    alignItems: "center",
  },
  durationRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  durBtn: {
    flex: 1,
    height: 36,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: spacing.xl,
  },
  toggle: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleOn: {
    backgroundColor: colors.priority.low,
  },
  toggleOff: {
    backgroundColor: colors.text.secondary,
  },
  toggleText: {
    fontWeight: "700",
    fontSize: 10,
  },
  bookActionBtn: {
    width: "100%",
    marginBottom: spacing.xl,
  },
});
