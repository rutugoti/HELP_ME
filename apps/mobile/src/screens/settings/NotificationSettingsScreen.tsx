// ─────────────────────────────────────────────────────────────
// LastMinute — Notification Settings Screen
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SettingsStackParamList } from "../../navigation/types";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography, Card, Button } from "../../components/common";
import { useNotifications } from "../../hooks/useNotifications";
import * as usersApi from "@lastminute/api-client/src/users";
import { api } from "../../services/api";
import { NotificationChannel } from "@lastminute/types";

type Props = NativeStackScreenProps<SettingsStackParamList, "NotificationSettings">;

const URGENCY_LEVELS = ["low", "medium", "high", "critical"] as const;
const CHANNELS: NotificationChannel[] = [
  NotificationChannel.Email,
  NotificationChannel.Push,
  NotificationChannel.Sms,
];

export const NotificationSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { updatePreferences, isUpdatingPreferences } = useNotifications();

  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  // Local state for channels per level
  const [lowChannels, setLowChannels] = useState<NotificationChannel[]>([]);
  const [mediumChannels, setMediumChannels] = useState<NotificationChannel[]>([]);
  const [highChannels, setHighChannels] = useState<NotificationChannel[]>([]);
  const [criticalChannels, setCriticalChannels] = useState<NotificationChannel[]>([]);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await usersApi.getPreferences(api);
        if (res.status === "success") {
          setLowChannels(res.data.notificationLowChannels || []);
          setMediumChannels(res.data.notificationMediumChannels || []);
          setHighChannels(res.data.notificationHighChannels || []);
          setCriticalChannels(res.data.notificationCriticalChannels || []);
        } else {
          setErrorText("Failed to load notification settings.");
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

  const getChannelsState = (level: (typeof URGENCY_LEVELS)[number]) => {
    switch (level) {
      case "low":
        return lowChannels;
      case "medium":
        return mediumChannels;
      case "high":
        return highChannels;
      case "critical":
        return criticalChannels;
    }
  };

  const toggleChannel = (level: (typeof URGENCY_LEVELS)[number], channel: NotificationChannel) => {
    const current = getChannelsState(level);
    const updated = current.includes(channel)
      ? current.filter((c) => c !== channel)
      : [...current, channel];

    switch (level) {
      case "low":
        setLowChannels(updated);
        break;
      case "medium":
        setMediumChannels(updated);
        break;
      case "high":
        setHighChannels(updated);
        break;
      case "critical":
        setCriticalChannels(updated);
        break;
    }
  };

  const handleSave = async () => {
    setErrorText(null);
    setSuccessText(null);

    try {
      await updatePreferences({
        low: lowChannels,
        medium: mediumChannels,
        high: highChannels,
        critical: criticalChannels,
      });
      setSuccessText("Preferences updated successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update preferences.";
      setErrorText(msg);
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
          Notification Channels
        </Typography>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
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
              Configure notification channels based on severity. Critical deadlines will escalate if
              ignored.
            </Typography>

            {URGENCY_LEVELS.map((level) => {
              const active = getChannelsState(level);
              return (
                <Card key={level} style={styles.levelCard}>
                  <Typography variant="bodyBold" style={styles.levelTitle}>
                    {level.toUpperCase()} Urgency
                  </Typography>
                  <View style={styles.row}>
                    {CHANNELS.map((ch) => {
                      const isSelected = active.includes(ch);
                      return (
                        <TouchableOpacity
                          key={ch}
                          activeOpacity={0.7}
                          onPress={() => toggleChannel(level, ch)}
                          style={[styles.channelTag, isSelected && styles.channelTagSelected]}
                        >
                          <Typography
                            variant="caption"
                            style={{
                              color: isSelected ? colors.white : colors.text.primary,
                              fontWeight: "700",
                            }}
                          >
                            {ch.toUpperCase()}
                          </Typography>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </Card>
              );
            })}

            <Button
              variant="primary"
              title="Save Preferences"
              onPress={handleSave}
              isLoading={isUpdatingPreferences}
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
  levelCard: {
    padding: spacing.md,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  levelTitle: {
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  channelTag: {
    flex: 1,
    height: 38,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    borderRadius: radii.md,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.primary,
  },
  channelTagSelected: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  saveBtn: {
    width: "100%",
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
