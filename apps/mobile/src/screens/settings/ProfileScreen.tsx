// ─────────────────────────────────────────────────────────────
// LastMinute — Profile & Account Screen
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SettingsStackParamList } from "../../navigation/types";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography, Card, Button } from "../../components/common";
import { useAuth } from "../../hooks/useAuth";
import * as usersApi from "@lastminute/api-client/src/users";
import { api } from "../../services/api";

type Props = NativeStackScreenProps<SettingsStackParamList, "Profile">;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [timezone, setTimezone] = useState(user?.timezone || "");
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  const handleSave = async () => {
    if (!fullName.trim()) {
      setErrorText("Please enter your name.");
      return;
    }

    setIsLoading(true);
    setErrorText(null);
    setSuccessText(null);

    try {
      const response = await usersApi.updateMe(api, {
        fullName: fullName.trim(),
        timezone: timezone.trim() || undefined,
      });

      if (response.status === "success") {
        updateProfile({
          fullName: response.data.fullName,
          timezone: response.data.timezone,
        });
        setSuccessText("Profile updated successfully!");
      } else {
        setErrorText("Failed to update profile.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating profile.";
      setErrorText(msg);
    } finally {
      setIsLoading(false);
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
          Profile & Account
        </Typography>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
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

        <Typography variant="bodyBold" style={styles.label}>
          Full Name
        </Typography>
        <TextInput
          placeholder="Enter your display name"
          placeholderTextColor={colors.text.secondary}
          value={fullName}
          onChangeText={setFullName}
          style={styles.textInput}
        />

        <Typography variant="bodyBold" style={styles.label}>
          IANA Timezone
        </Typography>
        <TextInput
          placeholder="E.g. America/New_York, UTC"
          placeholderTextColor={colors.text.secondary}
          value={timezone}
          onChangeText={setTimezone}
          style={styles.textInput}
        />

        <Typography variant="bodyBold" style={styles.label}>
          Assigned Consequence Role
        </Typography>
        <Card style={styles.roleCard}>
          <Typography variant="bodyBold" color={colors.accent.primary}>
            {user?.role?.toUpperCase()}
          </Typography>
          <Typography variant="captionMuted" style={styles.roleDesc}>
            Role assignment is fixed upon registration. It scales your priority points baseline
            (e.g. professional consequences vs. student impacts).
          </Typography>
        </Card>

        <Typography variant="bodyBold" style={styles.label}>
          Email Address
        </Typography>
        <TextInput
          value={user?.email}
          editable={false}
          style={[styles.textInput, styles.disabledInput]}
        />
        <Typography variant="captionMuted" style={styles.subLabel}>
          Contact support to change your email address.
        </Typography>

        <Button
          variant="primary"
          title="Save Changes"
          onPress={handleSave}
          isLoading={isLoading}
          style={styles.saveBtn}
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
  label: {
    fontSize: 14,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  subLabel: {
    marginTop: 2,
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
  disabledInput: {
    opacity: 0.6,
  },
  roleCard: {
    padding: spacing.md,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    backgroundColor: colors.background.secondary,
  },
  roleDesc: {
    marginTop: 4,
  },
  saveBtn: {
    width: "100%",
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
});
