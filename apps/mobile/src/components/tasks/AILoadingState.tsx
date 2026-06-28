// ─────────────────────────────────────────────────────────────
// LastMinute — AI Loading State Component
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography, Card } from "../common";

const STEPS = [
  "Parsing task metadata and deadline urgency...",
  "Querying role defaults and consequence severity weights...",
  "Evaluating active commitments and blocker states...",
  "Synthesizing email template draft and communication script...",
  "Applying behavioral protection rules...",
];

export const AILoadingState: React.FC = () => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STEPS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card style={styles.card}>
      <ActivityIndicator size="large" color={colors.accent.primary} style={styles.spinner} />
      <Typography variant="bodyBold" align="center" style={styles.title}>
        Drafting Protection Action...
      </Typography>
      <Typography
        variant="caption"
        color={colors.text.secondary}
        align="center"
        style={styles.subtitle}
      >
        {STEPS[stepIndex]}
      </Typography>

      <View style={styles.progressTrack}>
        <View
          style={[styles.progressBar, { width: `${((stepIndex + 1) / STEPS.length) * 100}%` }]}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.border.focus,
    borderWidth: 1,
    backgroundColor: colors.background.input,
  },
  spinner: {
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    height: 36,
    paddingHorizontal: spacing.md,
    lineHeight: 18,
  },
  progressTrack: {
    width: "80%",
    height: 4,
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.full,
    overflow: "hidden",
    marginTop: spacing.md,
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.accent.primary,
    borderRadius: radii.full,
  },
});
