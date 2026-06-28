// ─────────────────────────────────────────────────────────────
// LastMinute — Privacy & Masking Settings Screen
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SettingsStackParamList } from "../../navigation/types";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Typography, Card, Button } from "../../components/common";
import * as usersApi from "@lastminute/api-client/src/users";
import { api } from "../../services/api";
import { UserPreferences } from "@lastminute/types";

type Props = NativeStackScreenProps<SettingsStackParamList, "PrivacySettings">;

export const PrivacySettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  // Reference copy of current preferences
  const [rawPreferences, setRawPreferences] = useState<UserPreferences | null>(null);

  // Form states
  const [contentPrivacyMode, setContentPrivacyMode] = useState(false);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await usersApi.getPreferences(api);
        if (res.status === "success") {
          setRawPreferences(res.data);
          setContentPrivacyMode(res.data.contentPrivacyMode || false);
        } else {
          setErrorText("Failed to load privacy settings.");
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

  const handleSave = async () => {
    if (!rawPreferences) return;

    setErrorText(null);
    setSuccessText(null);
    setIsSaving(true);

    try {
      const response = await usersApi.updatePreferences(api, {
        notificationLowChannels: rawPreferences.notificationLowChannels,
        notificationMediumChannels: rawPreferences.notificationMediumChannels,
        notificationHighChannels: rawPreferences.notificationHighChannels,
        notificationCriticalChannels: rawPreferences.notificationCriticalChannels,
        workingHoursStart: rawPreferences.workingHoursStart,
        workingHoursEnd: rawPreferences.workingHoursEnd,
        workingDays: rawPreferences.workingDays,
        voiceEnabled: rawPreferences.voiceEnabled,
        autonomousSchedulingEnabled: rawPreferences.autonomousSchedulingEnabled,
        contentPrivacyMode,
        escalationContactName: rawPreferences.escalationContactName,
        escalationContactEmail: rawPreferences.escalationContactEmail,
        escalationThreshold: rawPreferences.escalationThreshold,
      });

      if (response.status === "success") {
        setRawPreferences(response.data);
        setSuccessText("Privacy settings saved successfully!");
      } else {
        setErrorText("Failed to save preferences.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save privacy preferences.";
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
          Privacy & Masking
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
              We value your privacy. Select options to filter or mask contents before sending data
              to generative AI models.
            </Typography>

            <Card style={styles.switchCard}>
              <View style={styles.switchRow}>
                <View style={{ flex: 1, marginRight: spacing.md }}>
                  <Typography variant="bodyBold">Task Content Masking</Typography>
                  <Typography
                    variant="caption"
                    color={colors.text.secondary}
                    style={styles.switchDesc}
                  >
                    Automatically mask names, numbers, and identifiable nouns in task
                    titles/descriptions before sending them to AI scoring or drafting models.
                  </Typography>
                </View>
                <Switch
                  value={contentPrivacyMode}
                  onValueChange={setContentPrivacyMode}
                  trackColor={{ false: colors.border.subtle, true: colors.accent.primary }}
                  thumbColor={colors.white}
                />
              </View>
            </Card>

            <Button
              variant="primary"
              title="Save Privacy Settings"
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
  switchCard: {
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
  },
});
