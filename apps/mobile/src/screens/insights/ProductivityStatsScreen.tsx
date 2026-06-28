// ─────────────────────────────────────────────────────────────
// LastMinute — Productivity Stats Screen
// ─────────────────────────────────────────────────────────────

import React from "react";
import { StyleSheet, View, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { DashboardStackParamList } from "../../navigation/types";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Typography, Card } from "../../components/common";
import { useInsights } from "../../hooks/useInsights";

type Props = NativeStackScreenProps<DashboardStackParamList, "ProductivityStats">;

export const ProductivityStatsScreen: React.FC<Props> = ({ navigation }) => {
  const { stats } = useInsights();

  // Fallback / mock data if stats empty
  const completionRate = stats?.completionRateByCategory ?? {
    work: 0.88,
    learning: 0.75,
    health: 0.9,
    finance: 0.6,
  };

  const delayRates = stats?.averageInitiationDelayByCategory ?? {
    work: 2.4,
    learning: 4.8,
    health: 0.5,
    finance: 12.0,
  };

  const overrideRate = stats?.overrideRate !== undefined ? stats.overrideRate * 100 : 12;

  const streaks = stats?.streaksByCategory ?? {
    work: 5,
    health: 12,
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
          Productivity Statistics
        </Typography>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Priority Override metric */}
        <Card style={styles.statCard}>
          <Typography variant="captionMuted">AI PRIORITIZATION OVERRIDE RATE</Typography>
          <Typography variant="h2" color={colors.priority.high} style={styles.metricVal}>
            {overrideRate.toFixed(0)}%
          </Typography>
          <Typography variant="caption" color={colors.text.secondary}>
            How often you disagree with or manually reorder the AI prioritizer. Lower rates indicate
            high trust alignment.
          </Typography>
        </Card>

        {/* Completion rate list */}
        <Typography variant="bodyBold" style={styles.sectionTitle}>
          Completion Rates by Category
        </Typography>
        <Card style={styles.listCard}>
          {Object.entries(completionRate).map(([cat, rate]) => (
            <View key={cat} style={styles.row}>
              <Typography variant="bodyBold" style={styles.categoryName}>
                {cat.toUpperCase()}
              </Typography>
              <Typography variant="body" color={colors.accent.primary}>
                {(rate * 100).toFixed(0)}%
              </Typography>
            </View>
          ))}
        </Card>

        {/* Average initiation delay */}
        <Typography variant="bodyBold" style={styles.sectionTitle}>
          Avg Task Initiation Delay (Hours)
        </Typography>
        <Card style={styles.listCard}>
          {Object.entries(delayRates).map(([cat, hours]) => (
            <View key={cat} style={styles.row}>
              <Typography variant="bodyBold" style={styles.categoryName}>
                {cat.toUpperCase()}
              </Typography>
              <Typography variant="body" color={colors.priority.medium}>
                {hours.toFixed(1)} hrs
              </Typography>
            </View>
          ))}
        </Card>

        {/* Streaks */}
        <Typography variant="bodyBold" style={styles.sectionTitle}>
          Active Habit Streaks
        </Typography>
        <Card style={styles.listCard}>
          {Object.keys(streaks).length > 0 ? (
            Object.entries(streaks).map(([cat, count]) => (
              <View key={cat} style={styles.row}>
                <Typography variant="bodyBold" style={styles.categoryName}>
                  {cat.toUpperCase()}
                </Typography>
                <Typography variant="body" color={colors.accent.primary}>
                  🔥 {count} days
                </Typography>
              </View>
            ))
          ) : (
            <Typography variant="captionMuted">No habit streaks active yet.</Typography>
          )}
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
    marginBottom: spacing.xs,
    fontSize: 14,
  },
  statCard: {
    padding: spacing.md,
    borderColor: colors.border.subtle,
    borderWidth: 1,
  },
  metricVal: {
    fontSize: 36,
    fontWeight: "900",
    marginVertical: spacing.xxs,
  },
  listCard: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderColor: colors.border.subtle,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  categoryName: {
    fontSize: 12,
  },
});
