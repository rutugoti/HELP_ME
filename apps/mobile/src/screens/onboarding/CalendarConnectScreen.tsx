// ─────────────────────────────────────────────────────────────
// LastMinute — Calendar Connect Screen
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Typography, Button, Card } from "../../components/common";
import { OnboardingStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<OnboardingStackParamList, "CalendarConnect">;

export const CalendarConnectScreen: React.FC<Props> = ({ navigation }) => {
  const [googleConnected, setGoogleConnected] = useState(false);
  const [outlookConnected, setOutlookConnected] = useState(false);

  const handleNext = () => {
    navigation.navigate("WorkingHours");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Typography variant="caption" color={colors.accent.primary} style={styles.stepIndicator}>
            STEP 2 OF 4
          </Typography>
          <Typography variant="h2" style={styles.title}>
            Connect Calendar
          </Typography>
          <Typography variant="bodyMuted" align="center">
            Synchronize external schedules so the Context Engine can automatically defend focus
            blocks.
          </Typography>
        </View>

        <View style={styles.providers}>
          <Card style={styles.providerCard}>
            <View style={styles.providerInfo}>
              <Typography variant="bodyBold">Google Calendar</Typography>
              <Typography variant="caption" color={colors.text.secondary}>
                Sync primary calendars and tasks.
              </Typography>
            </View>
            <Button
              variant={googleConnected ? "outline" : "primary"}
              title={googleConnected ? "Connected" : "Connect"}
              onPress={() => setGoogleConnected(!googleConnected)}
              style={styles.connectButton}
            />
          </Card>

          <Card style={styles.providerCard}>
            <View style={styles.providerInfo}>
              <Typography variant="bodyBold">Microsoft Outlook</Typography>
              <Typography variant="caption" color={colors.text.secondary}>
                Sync work accounts and availability.
              </Typography>
            </View>
            <Button
              variant={outlookConnected ? "outline" : "primary"}
              title={outlookConnected ? "Connected" : "Connect"}
              onPress={() => setOutlookConnected(!outlookConnected)}
              style={styles.connectButton}
            />
          </Card>

          <Typography variant="caption" align="center" style={styles.privacyNote}>
            🔒 Your calendars are encrypted end-to-end. We never sell your event metadata.
          </Typography>
        </View>

        <View style={styles.footer}>
          <Button
            variant="primary"
            title="Next: Set Hours"
            onPress={handleNext}
            style={styles.nextButton}
          />
          <TouchableOpacity style={styles.skipLink} onPress={handleNext} activeOpacity={0.7}>
            <Typography variant="caption" color={colors.text.secondary}>
              Skip for now
            </Typography>
          </TouchableOpacity>
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
  providers: {
    flex: 1,
    justifyContent: "center",
  },
  providerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  providerInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  connectButton: {
    minWidth: 100,
  },
  privacyNote: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    lineHeight: 16,
  },
  footer: {
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  nextButton: {
    width: "100%",
    marginBottom: spacing.sm,
  },
  skipLink: {
    paddingVertical: spacing.xs,
  },
});
