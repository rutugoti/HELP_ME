// ─────────────────────────────────────────────────────────────
// LastMinute — Behavior Report Screen
// ─────────────────────────────────────────────────────────────

import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { DashboardStackParamList } from "../../navigation/types";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography, Card } from "../../components/common";
import { useInsights } from "../../hooks/useInsights";

type Props = NativeStackScreenProps<DashboardStackParamList, "BehaviorReport">;

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const BehaviorReportScreen: React.FC<Props> = ({ navigation }) => {
  const { insights } = useInsights();

  // Fallbacks if backend doesn't have insights yet
  const procrastination = insights?.procrastinationPatterns ?? [
    { category: "finance", averageInitiationDelay: 12.0, onTimeRate: 0.6 },
    { category: "learning", averageInitiationDelay: 4.8, onTimeRate: 0.75 },
    { category: "work", averageInitiationDelay: 2.4, onTimeRate: 0.88 },
  ];

  const focusWindows = insights?.optimalFocusWindows ?? [
    { hour: 9, dayOfWeek: 1, productivityScore: 92 },
    { hour: 10, dayOfWeek: 2, productivityScore: 88 },
    { hour: 14, dayOfWeek: 3, productivityScore: 85 },
  ];

  const trends = insights?.categoryTrends ?? [
    { category: "work", completionRate30d: 0.88, completionRate90d: 0.82, trend: "improving" },
    { category: "learning", completionRate30d: 0.75, completionRate90d: 0.75, trend: "stable" },
    { category: "finance", completionRate30d: 0.6, completionRate90d: 0.72, trend: "declining" },
  ];

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return colors.priority.low; // Low urgency is green/good
      case "declining":
        return colors.priority.critical; // Critical is red/bad
      default:
        return colors.priority.medium; // Medium is yellow/neutral
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
          Behavior & Drift Report
        </Typography>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Procrastination Analysis */}
        <Typography variant="bodyBold" style={styles.sectionTitle}>
          ⚠️ Procrastination Patterns
        </Typography>
        <Typography variant="captionMuted" style={styles.subLabel}>
          Identifies categories with delay patterns before task initiation.
        </Typography>
        <Card style={styles.listCard}>
          {procrastination.map((item, index) => (
            <View key={index} style={styles.row}>
              <View>
                <Typography variant="bodyBold" style={styles.categoryName}>
                  {item.category.toUpperCase()}
                </Typography>
                <Typography variant="captionMuted">
                  Initiation delay: {item.averageInitiationDelay.toFixed(1)} hrs
                </Typography>
              </View>
              <Typography variant="bodyBold" color={colors.priority.high}>
                {(item.onTimeRate * 100).toFixed(0)}% On-Time
              </Typography>
            </View>
          ))}
        </Card>

        {/* Optimal Focus Windows */}
        <Typography variant="bodyBold" style={styles.sectionTitle}>
          🎯 Optimal Focus Windows
        </Typography>
        <Typography variant="captionMuted" style={styles.subLabel}>
          Your highest-productivity hours calculated by task completion velocity.
        </Typography>
        <Card style={styles.listCard}>
          {focusWindows.map((win, index) => {
            const displayHour = win.hour > 12 ? `${win.hour - 12} PM` : `${win.hour} AM`;
            return (
              <View key={index} style={styles.row}>
                <View>
                  <Typography variant="bodyBold" style={styles.categoryName}>
                    {DAY_NAMES[win.dayOfWeek]}s
                  </Typography>
                  <Typography variant="captionMuted">Peak Hour: {displayHour}</Typography>
                </View>
                <Typography variant="bodyBold" color={colors.accent.primary}>
                  Score: {win.productivityScore}
                </Typography>
              </View>
            );
          })}
        </Card>

        {/* Category Trends */}
        <Typography variant="bodyBold" style={styles.sectionTitle}>
          📈 30-Day Completion Trends
        </Typography>
        <Typography variant="captionMuted" style={styles.subLabel}>
          Performance changes compared to your 90-day baselines.
        </Typography>
        <Card style={styles.listCard}>
          {trends.map((t, index) => (
            <View key={index} style={styles.row}>
              <View>
                <Typography variant="bodyBold" style={styles.categoryName}>
                  {t.category.toUpperCase()}
                </Typography>
                <Typography variant="captionMuted">
                  30-day: {(t.completionRate30d * 100).toFixed(0)}% vs 90-day:{" "}
                  {(t.completionRate90d * 100).toFixed(0)}%
                </Typography>
              </View>
              <View style={[styles.trendBadge, { backgroundColor: getTrendColor(t.trend) }]}>
                <Typography variant="caption" color={colors.white} style={styles.trendText}>
                  {t.trend.toUpperCase()}
                </Typography>
              </View>
            </View>
          ))}
        </Card>
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
  sectionTitle: {
    marginTop: spacing.lg,
    fontSize: 14,
  },
  subLabel: {
    marginBottom: spacing.xs,
  },
  listCard: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  categoryName: {
    fontSize: 12,
  },
  trendBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  trendText: {
    fontWeight: "700",
    fontSize: 9,
    letterSpacing: 0.5,
  },
});
