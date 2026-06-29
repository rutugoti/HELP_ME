// ─────────────────────────────────────────────────────────────
// LastMinute — Working Hours Screen
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View, TouchableOpacity, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Typography, Button, Input, Card } from "../../components/common";
import { OnboardingStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<OnboardingStackParamList, "WorkingHours">;

const WEEKDAYS = [
  { label: "S", value: 0 },
  { label: "M", value: 1 },
  { label: "T", value: 2 },
  { label: "W", value: 3 },
  { label: "T", value: 4 },
  { label: "F", value: 5 },
  { label: "S", value: 6 },
];

export const WorkingHoursScreen: React.FC<Props> = ({ navigation }) => {
  const [startHour, setStartHour] = useState("09:00");
  const [endHour, setEndHour] = useState("17:00");
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const toggleDay = (day: number) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter((d) => d !== day));
    } else {
      setWorkingDays([...workingDays, day].sort());
    }
  };

  const handleNext = () => {
    // Navigate with parameters or save locally
    // In React Navigation we can pass parameters between screens
    navigation.navigate("NotificationPermission");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Typography variant="caption" color={colors.accent.primary} style={styles.stepIndicator}>
            STEP 3 OF 4
          </Typography>
          <Typography variant="h2" style={styles.title}>
            Define Focus Hours
          </Typography>
          <Typography variant="bodyMuted" align="center">
            Set your normal working window so the context engine knows when task deadlines are most
            critical.
          </Typography>
        </View>

        <Card style={styles.card}>
          <Typography variant="bodyBold" style={styles.sectionTitle}>
            Daily Schedule
          </Typography>
          <Typography variant="caption" style={styles.sectionSubtitle}>
            Define your start and end times for tasks.
          </Typography>

          <View style={styles.row}>
            <View style={styles.col}>
              <Input
                label="Start Time"
                value={startHour}
                onChangeText={setStartHour}
                placeholder="e.g. 09:00"
                maxLength={5}
              />
            </View>
            <View style={styles.col}>
              <Input
                label="End Time"
                value={endHour}
                onChangeText={setEndHour}
                placeholder="e.g. 17:00"
                maxLength={5}
              />
            </View>
          </View>

          <Typography variant="bodyBold" style={styles.dayTitle}>
            Active Working Days
          </Typography>
          <View style={styles.daysRow}>
            {WEEKDAYS.map((day) => {
              const isActive = workingDays.includes(day.value);
              return (
                <TouchableOpacity
                  key={day.value}
                  onPress={() => toggleDay(day.value)}
                  activeOpacity={0.7}
                  style={[styles.dayCircle, isActive && styles.dayCircleActive]}
                >
                  <Typography
                    variant="caption"
                    style={[styles.dayText, isActive && styles.dayTextActive]}
                  >
                    {day.label}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        <View style={styles.footer}>
          <Button
            variant="primary"
            title="Next: Set Notifications"
            onPress={handleNext}
            style={styles.nextButton}
          />
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
  scrollContainer: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  stepIndicator: {
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  title: {
    marginBottom: spacing.xs,
  },
  card: {
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.xxs,
  },
  sectionSubtitle: {
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  col: {
    flex: 1,
  },
  dayTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border.default,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.tertiary,
  },
  dayCircleActive: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  dayText: {
    color: colors.text.secondary,
    fontWeight: "600",
  },
  dayTextActive: {
    color: colors.white,
  },
  footer: {
    paddingVertical: spacing.md,
  },
  nextButton: {
    width: "100%",
  },
});
