// ─────────────────────────────────────────────────────────────
// LastMinute — Calendar Settings Screen
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SettingsStackParamList } from "../../navigation/types";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography, Card, Button } from "../../components/common";
import * as usersApi from "@lastminute/api-client/src/users";
import { api } from "../../services/api";
import { UserPreferences } from "@lastminute/types";

type Props = NativeStackScreenProps<SettingsStackParamList, "CalendarSettings">;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const CalendarSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  // Reference copy of current preferences
  const [rawPreferences, setRawPreferences] = useState<UserPreferences | null>(null);

  // Form states
  const [workingHoursStart, setWorkingHoursStart] = useState("09:00");
  const [workingHoursEnd, setWorkingHoursEnd] = useState("17:00");
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [autonomousSchedulingEnabled, setAutonomousSchedulingEnabled] = useState(false);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await usersApi.getPreferences(api);
        if (res.status === "success") {
          setRawPreferences(res.data);
          setWorkingHoursStart(res.data.workingHoursStart || "09:00");
          setWorkingHoursEnd(res.data.workingHoursEnd || "17:00");
          setWorkingDays(res.data.workingDays || [1, 2, 3, 4, 5]);
          setAutonomousSchedulingEnabled(res.data.autonomousSchedulingEnabled || false);
        } else {
          setErrorText("Failed to load calendar settings.");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error loading preferences.";
        setErrorText(msg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrefs();
  }, []);

  const toggleDay = (dayIndex: number) => {
    if (workingDays.includes(dayIndex)) {
      setWorkingDays(workingDays.filter((d) => d !== dayIndex));
    } else {
      setWorkingDays([...workingDays, dayIndex].sort());
    }
  };

  const handleSave = async () => {
    if (!rawPreferences) return;

    setErrorText(null);
    setSuccessText(null);

    // Basic time format validation (HH:MM)
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(workingHoursStart) || !timeRegex.test(workingHoursEnd)) {
      setErrorText("Please specify working hours in HH:MM format.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await usersApi.updatePreferences(api, {
        notificationLowChannels: rawPreferences.notificationLowChannels,
        notificationMediumChannels: rawPreferences.notificationMediumChannels,
        notificationHighChannels: rawPreferences.notificationHighChannels,
        notificationCriticalChannels: rawPreferences.notificationCriticalChannels,
        workingHoursStart,
        workingHoursEnd,
        workingDays,
        voiceEnabled: rawPreferences.voiceEnabled,
        autonomousSchedulingEnabled,
        contentPrivacyMode: rawPreferences.contentPrivacyMode,
        escalationContactName: rawPreferences.escalationContactName,
        escalationContactEmail: rawPreferences.escalationContactEmail,
        escalationThreshold: rawPreferences.escalationThreshold,
      });

      if (response.status === "success") {
        setRawPreferences(response.data);
        setSuccessText("Calendar settings saved successfully!");
      } else {
        setErrorText("Failed to save preferences.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save calendar preferences.";
      setErrorText(msg);
    } finally {
      setIsSaving(false);
    }
  };

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
          Calendar & Hours
        </Typography>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.accent.primary} style={styles.spinner} />
        ) : (
          <View>
            {errorText && (
              <Card style={styles.errorCard}>
                <Typography variant="caption" color={colors.priority.critical}>
                  ⚠️ {errorText}
                </Typography>
              </Card>
            )}

            {successText && (
              <Card style={styles.successCard}>
                <Typography variant="caption" color={colors.priority.low}>
                  ✓ {successText}
                </Typography>
              </Card>
            )}

            <Typography variant="bodyMuted" style={styles.subtext}>
              Set up your calendar parameters. The system scheduling engine schedules focus blocks
              only within your preferred availability.
            </Typography>

            <View style={styles.hoursRow}>
              <View style={styles.hourCol}>
                <Typography variant="bodyBold" style={styles.label}>
                  Working Hours Start
                </Typography>
                <TextInput
                  placeholder="09:00"
                  placeholderTextColor={colors.text.secondary}
                  value={workingHoursStart}
                  onChangeText={setWorkingHoursStart}
                  style={styles.textInput}
                />
              </View>

              <View style={styles.hourCol}>
                <Typography variant="bodyBold" style={styles.label}>
                  Working Hours End
                </Typography>
                <TextInput
                  placeholder="17:00"
                  placeholderTextColor={colors.text.secondary}
                  value={workingHoursEnd}
                  onChangeText={setWorkingHoursEnd}
                  style={styles.textInput}
                />
              </View>
            </View>

            <Typography variant="bodyBold" style={styles.label}>
              Working Days of Week
            </Typography>
            <View style={styles.daysRow}>
              {WEEKDAYS.map((day, index) => {
                const isSelected = workingDays.includes(index);
                return (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.7}
                    onPress={() => toggleDay(index)}
                    style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
                  >
                    <Typography
                      variant="caption"
                      style={{
                        color: isSelected ? colors.white : colors.text.primary,
                        fontWeight: "700",
                      }}
                    >
                      {day}
                    </Typography>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Card style={styles.autonomousCard}>
              <View style={styles.switchRow}>
                <View style={{ flex: 1, marginRight: spacing.md }}>
                  <Typography variant="bodyBold">Autonomous Scheduling</Typography>
                  <Typography
                    variant="caption"
                    color={colors.text.secondary}
                    style={styles.switchDesc}
                  >
                    Allow AI agent to schedule focus blocks directly in your Google Calendar without
                    prompting you.
                  </Typography>
                </View>
                <Switch
                  value={autonomousSchedulingEnabled}
                  onValueChange={setAutonomousSchedulingEnabled}
                  trackColor={{ false: colors.border.subtle, true: colors.accent.primary }}
                  thumbColor={colors.white}
                />
              </View>
            </Card>

            <Button
              variant="primary"
              title="Save Calendar Settings"
              onPress={handleSave}
              isLoading={isSaving}
              style={styles.saveBtn}
            />
          </View>
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
  spinner: {
    marginVertical: spacing.xl,
  },
  errorCard: {
    borderColor: colors.priority.critical,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  successCard: {
    borderColor: colors.priority.low,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  subtext: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  hoursRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  hourCol: {
    flex: 1,
  },
  textInput: {
    backgroundColor: colors.background.secondary,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    borderRadius: radii.md,
    color: colors.text.primary,
    padding: spacing.sm,
    height: 44,
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 4,
    marginBottom: spacing.lg,
  },
  dayButton: {
    flex: 1,
    height: 38,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    borderRadius: radii.sm,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
  },
  dayButtonSelected: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  autonomousCard: {
    padding: spacing.md,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchDesc: {
    marginTop: 2,
  },
  saveBtn: {
    width: "100%",
    marginBottom: spacing.xl,
  },
});
