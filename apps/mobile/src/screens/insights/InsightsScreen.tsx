// ─────────────────────────────────────────────────────────────
// LastMinute — Insights Main Screen
// ─────────────────────────────────────────────────────────────

import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { DashboardStackParamList } from "../../navigation/types";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Typography, Card } from "../../components/common";
import { useInsights } from "../../hooks/useInsights";

type Props = NativeStackScreenProps<DashboardStackParamList, "Insights">;

export const InsightsScreen: React.FC<Props> = ({ navigation }) => {
  const { insights, stats, isLoading, error, refetch } = useInsights();

  useEffect(() => {
    refetch();
  }, []);

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
          AI Insights & Analytics
        </Typography>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.accent.primary} style={styles.spinner} />
        ) : error ? (
          <Card style={styles.errorCard}>
            <Typography variant="caption" color={colors.priority.critical}>
              ⚠️ Failed to load insights data.
            </Typography>
          </Card>
        ) : (
          <View style={styles.content}>
            {/* Score Card */}
            <Card style={styles.scoreCard}>
              <Typography variant="captionMuted" align="center">
                7-DAY PRODUCTIVITY INDEX
              </Typography>
              <Typography
                variant="h1"
                color={colors.accent.primary}
                align="center"
                style={styles.scoreNum}
              >
                {stats?.productivityScore ?? 85}
              </Typography>
              <Typography variant="caption" align="center" color={colors.text.secondary}>
                Your productivity rating is calculated from completed deliverables and AI override
                patterns.
              </Typography>
            </Card>

            {/* Quick Stats Summary Card */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate("ProductivityStats")}
            >
              <Card style={styles.navigationCard}>
                <View style={styles.cardHeader}>
                  <Typography variant="bodyBold">📊 Productivity Statistics</Typography>
                  <Typography variant="body" color={colors.accent.primary}>
                    ➔
                  </Typography>
                </View>
                <Typography variant="caption" color={colors.text.secondary}>
                  Review completion rates by category, streaks, and AI priority override rates.
                </Typography>
              </Card>
            </TouchableOpacity>

            {/* Behavior Analysis Card */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate("BehaviorReport")}
            >
              <Card style={styles.navigationCard}>
                <View style={styles.cardHeader}>
                  <Typography variant="bodyBold">🧠 Behavioral & Drift Report</Typography>
                  <Typography variant="body" color={colors.accent.primary}>
                    ➔
                  </Typography>
                </View>
                <Typography variant="caption" color={colors.text.secondary}>
                  Analyze procrastination trends, optimal focus windows, and active behavior drift
                  flags.
                </Typography>
              </Card>
            </TouchableOpacity>

            {/* AI Advisor Callout */}
            <Card style={styles.adviceCard}>
              <Typography
                variant="bodyBold"
                color={colors.accent.primary}
                style={styles.adviceTitle}
              >
                🔮 AI Proactive Advice
              </Typography>
              <Typography variant="caption" style={styles.adviceText}>
                {insights?.procrastinationPatterns && insights.procrastinationPatterns.length > 0
                  ? `You are showing initiation delays on tasks in the "${insights.procrastinationPatterns[0].category}" category. Consider scheduling shorter focus blocks for these.`
                  : "We're monitoring your task completion speeds. Continue checking off deliverables on time to improve focus window projections."}
              </Typography>
            </Card>
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
  },
  content: {
    gap: spacing.md,
  },
  scoreCard: {
    padding: spacing.lg,
    alignItems: "center",
    borderColor: colors.border.subtle,
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  scoreNum: {
    fontSize: 54,
    fontWeight: "900",
    marginVertical: spacing.xs,
  },
  navigationCard: {
    padding: spacing.md,
    borderColor: colors.border.subtle,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xxs,
  },
  adviceCard: {
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderColor: colors.accent.primary,
    borderWidth: 1,
  },
  adviceTitle: {
    marginBottom: spacing.xs,
  },
  adviceText: {
    lineHeight: 18,
  },
});
