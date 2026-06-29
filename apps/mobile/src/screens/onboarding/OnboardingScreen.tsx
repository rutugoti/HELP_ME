// ─────────────────────────────────────────────────────────────
// LastMinute — Onboarding Intro Screen
// ─────────────────────────────────────────────────────────────

import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Typography, Button, Card } from "../../components/common";
import { OnboardingStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<OnboardingStackParamList, "OnboardingIntro">;

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Typography variant="caption" color={colors.accent.primary} style={styles.stepIndicator}>
            STEP 1 OF 4
          </Typography>
          <Typography variant="h2" style={styles.title}>
            Personalize Your Flow
          </Typography>
          <Typography variant="bodyMuted" align="center">
            LastMinute uses a dynamic context engine to calculate real-time priority scores. Let's
            customize your rules.
          </Typography>
        </View>

        <View style={styles.features}>
          <Card style={styles.featureCard}>
            <Typography variant="bodyBold" style={styles.featureTitle}>
              ⚡ Consequence Scoring
            </Typography>
            <Typography variant="caption" style={styles.featureDesc}>
              Tasks are scored based on the real-world impact of missing them, tailored specifically
              to your professional role.
            </Typography>
          </Card>

          <Card style={styles.featureCard}>
            <Typography variant="bodyBold" style={styles.featureTitle}>
              🛡️ Calendar Protection
            </Typography>
            <Typography variant="caption" style={styles.featureDesc}>
              Automatically reserve focused time blocks to ensure work on critical deliverables is
              never delayed.
            </Typography>
          </Card>

          <Card style={styles.featureCard}>
            <Typography variant="bodyBold" style={styles.featureTitle}>
              🔔 Smart Escapes & Escalations
            </Typography>
            <Typography variant="caption" style={styles.featureDesc}>
              Configure notification overrides and escalation contacts so critical details never
              slip by unnoticed.
            </Typography>
          </Card>
        </View>

        <View style={styles.footer}>
          <Button
            variant="primary"
            title="Configure Workspace"
            onPress={() => navigation.navigate("CalendarConnect")}
            style={styles.nextButton}
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
  features: {
    flex: 1,
    justifyContent: "center",
  },
  featureCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  featureTitle: {
    marginBottom: spacing.xxs,
  },
  featureDesc: {
    color: colors.text.secondary,
    lineHeight: 16,
  },
  footer: {
    paddingVertical: spacing.md,
  },
  nextButton: {
    width: "100%",
  },
});
