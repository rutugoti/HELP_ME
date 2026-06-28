// ─────────────────────────────────────────────────────────────
// LastMinute — Streak Indicator Component
// ─────────────────────────────────────────────────────────────

import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography, Card } from "../common";

interface Props {
  currentStreak: number;
  longestStreak: number;
  hasBehavioralDrift?: boolean;
}

export const StreakIndicator: React.FC<Props> = ({
  currentStreak,
  longestStreak,
  hasBehavioralDrift = false,
}) => {
  return (
    <Card style={styles.card}>
      <View style={styles.streakSection}>
        <View style={styles.flameContainer}>
          <Typography style={styles.flameEmoji}>🔥</Typography>
          <Typography variant="h1" color={colors.accent.primary} style={styles.streakCount}>
            {currentStreak}
          </Typography>
          <Typography variant="caption" color={colors.accent.primary} style={styles.streakLabel}>
            DAY STREAK
          </Typography>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricsContainer}>
          <View style={styles.metricRow}>
            <Typography variant="captionMuted">Longest Streak</Typography>
            <Typography variant="bodyBold">👑 {longestStreak} days</Typography>
          </View>

          {hasBehavioralDrift && (
            <View style={styles.driftAlert}>
              <Typography
                variant="caption"
                color={colors.priority.critical}
                style={styles.driftTitle}
              >
                ⚠️ Behavioral Drift
              </Typography>
              <Typography variant="captionMuted" style={styles.driftBody}>
                Completion frequency is dipping. Reset your focus blocks to get back on track.
              </Typography>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  streakSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  flameContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 90,
  },
  flameEmoji: {
    fontSize: 28,
  },
  streakCount: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "800",
    marginVertical: 2,
  },
  streakLabel: {
    fontWeight: "700",
    fontSize: 9,
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: "80%",
    backgroundColor: colors.border.subtle,
  },
  metricsContainer: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.xs,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  driftAlert: {
    backgroundColor: colors.background.primary,
    borderColor: colors.priority.critical,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: spacing.xs,
    gap: 2,
  },
  driftTitle: {
    fontWeight: "700",
    fontSize: 10,
  },
  driftBody: {
    fontSize: 10,
    lineHeight: 12,
  },
});
