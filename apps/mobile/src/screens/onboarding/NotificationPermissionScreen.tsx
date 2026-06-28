// ─────────────────────────────────────────────────────────────
// LastMinute — Notification Permission Screen
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { StyleSheet, View, SafeAreaView, TouchableOpacity, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Notifications from "expo-notifications";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Typography, Button, Card, Toast } from "../../components/common";
import { OnboardingStackParamList } from "../../navigation/types";
import { useAuth } from "../../hooks/useAuth";
import { NotificationChannel } from "@lastminute/types";

type Props = NativeStackScreenProps<OnboardingStackParamList, "NotificationPermission">;

export const NotificationPermissionScreen: React.FC<Props> = ({ navigation: _navigation }) => {
  const { completeOnboarding, error, isLoading } = useAuth();
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);

  const handleComplete = async () => {
    if (pushEnabled) {
      try {
        await Notifications.requestPermissionsAsync();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to request notifications permission:", err);
      }
    }

    // Build the default channels based on user preferences
    const lowChannels: NotificationChannel[] = [NotificationChannel.InApp];
    const mediumChannels: NotificationChannel[] = [NotificationChannel.InApp];
    const highChannels: NotificationChannel[] = [NotificationChannel.InApp];
    const criticalChannels: NotificationChannel[] = [NotificationChannel.InApp];

    if (pushEnabled) {
      mediumChannels.push(NotificationChannel.Push);
      highChannels.push(NotificationChannel.Push);
      criticalChannels.push(NotificationChannel.Push);
    }
    if (emailEnabled) {
      highChannels.push(NotificationChannel.Email);
      criticalChannels.push(NotificationChannel.Email);
    }
    if (smsEnabled) {
      criticalChannels.push(NotificationChannel.Sms);
    }

    const success = await completeOnboarding({
      notificationLowChannels: lowChannels,
      notificationMediumChannels: mediumChannels,
      notificationHighChannels: highChannels,
      notificationCriticalChannels: criticalChannels,
      workingHoursStart: "09:00",
      workingHoursEnd: "17:00",
      workingDays: [1, 2, 3, 4, 5],
      voiceEnabled: true,
      autonomousSchedulingEnabled: false,
      contentPrivacyMode: false,
      escalationContactEmail: null,
      escalationContactName: null,
      escalationThreshold: null,
    });

    if (success) {
      setToastMsg("Setup complete! Welcome to LastMinute.");
      setToastVisible(true);
      // Wait a moment for toast, then transition state changes (RootNavigator handles redirect)
    } else {
      Alert.alert("Error", error || "Failed to complete setup. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Toast
        visible={toastVisible}
        message={toastMsg}
        type="success"
        onClose={() => setToastVisible(false)}
      />

      <View style={styles.container}>
        <View style={styles.header}>
          <Typography variant="caption" color={colors.accent.primary} style={styles.stepIndicator}>
            STEP 4 OF 4
          </Typography>
          <Typography variant="h2" style={styles.title}>
            Stay Updated
          </Typography>
          <Typography variant="bodyMuted" align="center">
            Configure delivery channels to keep track of urgent task notifications and consequence
            escalations.
          </Typography>
        </View>

        <View style={styles.settings}>
          <Card style={styles.toggleCard}>
            <View style={styles.toggleInfo}>
              <Typography variant="bodyBold">Push Notifications</Typography>
              <Typography variant="caption" color={colors.text.secondary}>
                Real-time alerts for priority updates and alarms.
              </Typography>
            </View>
            <TouchableOpacity
              onPress={() => setPushEnabled(!pushEnabled)}
              activeOpacity={0.7}
              style={[styles.toggleBtn, pushEnabled && styles.toggleBtnActive]}
            >
              <Typography
                variant="caption"
                style={pushEnabled ? styles.toggleTextActive : styles.toggleText}
              >
                {pushEnabled ? "ON" : "OFF"}
              </Typography>
            </TouchableOpacity>
          </Card>

          <Card style={styles.toggleCard}>
            <View style={styles.toggleInfo}>
              <Typography variant="bodyBold">Email Updates</Typography>
              <Typography variant="caption" color={colors.text.secondary}>
                Daily brief reviews and weekly behavioral reports.
              </Typography>
            </View>
            <TouchableOpacity
              onPress={() => setEmailEnabled(!emailEnabled)}
              activeOpacity={0.7}
              style={[styles.toggleBtn, emailEnabled && styles.toggleBtnActive]}
            >
              <Typography
                variant="caption"
                style={emailEnabled ? styles.toggleTextActive : styles.toggleText}
              >
                {emailEnabled ? "ON" : "OFF"}
              </Typography>
            </TouchableOpacity>
          </Card>

          <Card style={styles.toggleCard}>
            <View style={styles.toggleInfo}>
              <Typography variant="bodyBold">SMS Alerts</Typography>
              <Typography variant="caption" color={colors.text.secondary}>
                Direct escalation texts for critical, high-risk items.
              </Typography>
            </View>
            <TouchableOpacity
              onPress={() => setSmsEnabled(!smsEnabled)}
              activeOpacity={0.7}
              style={[styles.toggleBtn, smsEnabled && styles.toggleBtnActive]}
            >
              <Typography
                variant="caption"
                style={smsEnabled ? styles.toggleTextActive : styles.toggleText}
              >
                {smsEnabled ? "ON" : "OFF"}
              </Typography>
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.footer}>
          <Button
            variant="primary"
            title="Complete Setup"
            onPress={handleComplete}
            isLoading={isLoading}
            style={styles.completeButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginTop: spacing.md,
  },
  stepIndicator: {
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  title: {
    marginBottom: spacing.xs,
  },
  settings: {
    flex: 1,
    justifyContent: "center",
  },
  toggleCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  toggleInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  toggleBtn: {
    width: 60,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.tertiary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  toggleBtnActive: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  toggleText: {
    color: colors.text.secondary,
    fontWeight: "700",
    fontSize: 11,
  },
  toggleTextActive: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 11,
  },
  footer: {
    paddingVertical: spacing.md,
  },
  completeButton: {
    width: "100%",
  },
});
