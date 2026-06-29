// ─────────────────────────────────────────────────────────────
// LastMinute — Escalation Settings Screen
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SettingsStackParamList } from "../../navigation/types";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography, Card, Button } from "../../components/common";
import * as usersApi from "@lastminute/api-client/src/users";
import { api } from "../../services/api";
import { EscalationThreshold, UserPreferences } from "@lastminute/types";

type Props = NativeStackScreenProps<SettingsStackParamList, "EscalationSettings">;

const THRESHOLD_OPTIONS: { label: string; value: EscalationThreshold | null }[] = [
  { label: "HIGH URGENCY", value: EscalationThreshold.HighAndAbove },
  { label: "CRITICAL URGENCY", value: EscalationThreshold.CriticalOnly },
  { label: "DISABLED", value: null },
];

export const EscalationSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  // Reference copy of current preferences
  const [rawPreferences, setRawPreferences] = useState<UserPreferences | null>(null);

  // Form states
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [threshold, setThreshold] = useState<EscalationThreshold | null>(null);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await usersApi.getPreferences(api);
        if (res.status === "success") {
          setRawPreferences(res.data);
          setContactName(res.data.escalationContactName || "");
          setContactEmail(res.data.escalationContactEmail || "");
          setThreshold(res.data.escalationThreshold || null);
        } else {
          setErrorText("Failed to load escalation settings.");
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

    // Basic email validation if provided
    if (contactEmail.trim() && !contactEmail.includes("@")) {
      setErrorText("Please enter a valid email address.");
      return;
    }

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
        contentPrivacyMode: rawPreferences.contentPrivacyMode,
        escalationContactName: contactName.trim() || null,
        escalationContactEmail: contactEmail.trim() || null,
        escalationThreshold: threshold,
      });

      if (response.status === "success") {
        setRawPreferences(response.data);
        setSuccessText("Escalation contact saved successfully!");
      } else {
        setErrorText("Failed to save preferences.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save escalation preferences.";
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
          Escalation Settings
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
              When you fail to check off critical tasks, the system will automatically alert your
              designated escalation advisor via email.
            </Typography>

            <Typography variant="bodyBold" style={styles.label}>
              Contact Name
            </Typography>
            <TextInput
              placeholder="E.g. John Doe, Manager Name"
              placeholderTextColor={colors.text.secondary}
              value={contactName}
              onChangeText={setContactName}
              style={styles.textInput}
            />

            <Typography variant="bodyBold" style={styles.label}>
              Contact Email
            </Typography>
            <TextInput
              placeholder="escalation-partner@example.com"
              placeholderTextColor={colors.text.secondary}
              value={contactEmail}
              onChangeText={setContactEmail}
              style={styles.textInput}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Typography variant="bodyBold" style={styles.label}>
              Escalation Urgency Threshold
            </Typography>
            <Typography variant="caption" color={colors.text.secondary} style={styles.subLabel}>
              Define when the contact should be automatically notified.
            </Typography>

            <View style={styles.thresholdCol}>
              {THRESHOLD_OPTIONS.map((opt, idx) => {
                const isSelected = threshold === opt.value;
                return (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.7}
                    onPress={() => setThreshold(opt.value)}
                    style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                  >
                    <Typography
                      variant="bodyBold"
                      style={{
                        color: isSelected ? colors.white : colors.text.primary,
                        fontSize: 13,
                      }}
                    >
                      {opt.label}
                    </Typography>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Button
              variant="primary"
              title="Save Contact"
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
  subLabel: {
    marginBottom: spacing.sm,
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
  thresholdCol: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  optionCard: {
    padding: spacing.md,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    borderRadius: radii.md,
    backgroundColor: colors.background.secondary,
  },
  optionCardSelected: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  saveBtn: {
    width: "100%",
    marginBottom: spacing.xl,
  },
});
