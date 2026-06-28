// ─────────────────────────────────────────────────────────────
// LastMinute — Task Card Skeleton Component
// ─────────────────────────────────────────────────────────────

import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Card } from "../common/Card";

export const TaskCardSkeleton: React.FC = () => {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.shimmerRow}>
          <View style={[styles.shimmer, styles.badge]} />
          <View style={[styles.shimmer, styles.tag]} />
        </View>
        <View style={[styles.shimmer, styles.countdown]} />
      </View>

      <View style={styles.body}>
        <View style={[styles.shimmer, styles.titleLine]} />
        <View style={[styles.shimmer, styles.titleLineShort]} />
      </View>

      <View style={styles.footer}>
        <View style={[styles.shimmer, styles.indicator]} />
        <View style={[styles.shimmer, styles.scoreBar]} />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  shimmerRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  shimmer: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.sm,
    opacity: 0.5,
  },
  badge: {
    width: 60,
    height: 18,
  },
  tag: {
    width: 50,
    height: 18,
  },
  countdown: {
    width: 80,
    height: 14,
  },
  body: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  titleLine: {
    width: "90%",
    height: 16,
  },
  titleLineShort: {
    width: "60%",
    height: 16,
  },
  footer: {
    gap: spacing.sm,
  },
  indicator: {
    width: 100,
    height: 12,
  },
  scoreBar: {
    width: "100%",
    height: 6,
    borderRadius: radii.full,
  },
});
