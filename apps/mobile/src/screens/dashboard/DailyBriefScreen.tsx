// ─────────────────────────────────────────────────────────────
// LastMinute — Daily Brief Screen
// ─────────────────────────────────────────────────────────────

import React from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Typography, Card } from "../../components/common";
import { DashboardStackParamList } from "../../navigation/types";
import { aiApi } from "@lastminute/api-client";
import { api } from "../../services/api";
import { RecommendationSeverity } from "@lastminute/types";

type Props = NativeStackScreenProps<DashboardStackParamList, "DailyBrief">;

export const DailyBriefScreen: React.FC<Props> = ({ navigation }) => {
  const queryClient = useQueryClient();

  // Query AI recommendations
  const { data: recommendationsRes, isLoading: isRecsLoading } = useQuery({
    queryKey: ["aiRecommendations"],
    queryFn: () => aiApi.getRecommendations(api),
  });

  // Query behavioral insights
  const { data: insightsRes, isLoading: isInsightsLoading } = useQuery({
    queryKey: ["aiInsights"],
    queryFn: () => aiApi.getInsights(api),
  });

  const recommendations = recommendationsRes?.status === "success" ? recommendationsRes.data : [];
  const insights = insightsRes?.status === "success" ? insightsRes.data : null;

  // Dismiss mutation
  const dismissMutation = useMutation({
    mutationFn: (id: string) => aiApi.dismissRecommendation(api, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aiRecommendations"] });
    },
  });

  const getSeverityStyle = (severity: RecommendationSeverity) => {
    switch (severity) {
      case RecommendationSeverity.Warning:
        return { color: colors.priority.high, border: colors.priority.high };
      case RecommendationSeverity.Advisory:
        return { color: colors.accent.primary, border: colors.accent.primary };
      case RecommendationSeverity.Informational:
      default:
        return { color: colors.text.secondary, border: colors.border.subtle };
    }
  };

  const todayStr = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const isLoading = isRecsLoading || isInsightsLoading;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Typography variant="bodyBold" color={colors.text.secondary}>
              ➔ Back
            </Typography>
          </TouchableOpacity>
          <Typography variant="h2" style={styles.title}>
            Daily Brief
          </Typography>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.dateBanner}>
            <Typography variant="caption" color={colors.accent.primary} style={styles.dateLabel}>
              TODAY'S SUMMARY
            </Typography>
            <Typography variant="h3">{todayStr}</Typography>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent.primary} />
              <Typography variant="caption" style={styles.loadingText}>
                Analyzing schedule with Context Engine...
              </Typography>
            </View>
          ) : (
            <>
              {/* Context Insights Card */}
              {insights && (
                <Card style={styles.insightsCard}>
                  <Typography variant="bodyBold" style={styles.cardTitle}>
                    🧠 Behavioral Velocity
                  </Typography>
                  {insights.procrastinationPatterns &&
                  insights.procrastinationPatterns.length > 0 ? (
                    insights.procrastinationPatterns.map((pattern) => (
                      <Typography
                        key={pattern.category}
                        variant="caption"
                        style={styles.insightText}
                      >
                        • {pattern.category}: {pattern.onTimeRate}% on-time, average{" "}
                        {Math.round(pattern.averageInitiationDelay / 60)}h latency.
                      </Typography>
                    ))
                  ) : (
                    <Typography variant="caption" style={styles.insightText}>
                      No procrastination patterns identified yet.
                    </Typography>
                  )}

                  {insights.categoryTrends && insights.categoryTrends.length > 0 && (
                    <View style={{ marginTop: spacing.sm }}>
                      <Typography
                        variant="caption"
                        style={{ fontWeight: "700", marginBottom: spacing.xs }}
                      >
                        Category Trends:
                      </Typography>
                      {insights.categoryTrends.map((trend) => (
                        <Typography
                          key={trend.category}
                          variant="caption"
                          style={styles.insightText}
                        >
                          • {trend.category}: {trend.trend} ({trend.completionRate30d}% completed in
                          30d).
                        </Typography>
                      ))}
                    </View>
                  )}
                </Card>
              )}

              {/* Recommendations Title */}
              <Typography variant="bodyBold" style={styles.sectionTitle}>
                ⚡ AI Recommendations
              </Typography>

              {recommendations.length > 0 ? (
                recommendations.map((rec) => {
                  const stylesConfig = getSeverityStyle(rec.severity);
                  return (
                    <Card
                      key={rec.id}
                      style={[styles.recCard, { borderColor: stylesConfig.border }]}
                    >
                      <View style={styles.recHeader}>
                        <Typography
                          variant="caption"
                          style={[styles.severityBadge, { color: stylesConfig.color }]}
                        >
                          {rec.severity.toUpperCase()} — {rec.recommendationType}
                        </Typography>
                        <TouchableOpacity
                          onPress={() => dismissMutation.mutate(rec.id)}
                          disabled={dismissMutation.isPending}
                        >
                          <Typography variant="caption" color={colors.text.secondary}>
                            ✕
                          </Typography>
                        </TouchableOpacity>
                      </View>
                      <Typography variant="bodyBold" style={styles.recContent}>
                        {rec.content}
                      </Typography>
                      <Typography
                        variant="caption"
                        color={colors.text.secondary}
                        style={styles.recReasoning}
                      >
                        Reasoning: {rec.reasoning}
                      </Typography>
                    </Card>
                  );
                })
              ) : (
                <Card style={styles.emptyCard}>
                  <Typography variant="bodyMuted" align="center">
                    All clear! No current recommendations for your schedule.
                  </Typography>
                </Card>
              )}
            </>
          )}
        </ScrollView>
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
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  backButton: {
    marginRight: spacing.md,
    transform: [{ rotate: "180deg" }],
  },
  title: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  dateBanner: {
    marginBottom: spacing.lg,
  },
  dateLabel: {
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: spacing.xxs,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.md,
  },
  insightsCard: {
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    marginBottom: spacing.sm,
  },
  insightText: {
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    lineHeight: 16,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  recCard: {
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  recHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  severityBadge: {
    fontWeight: "700",
    fontSize: 9,
  },
  recContent: {
    marginBottom: spacing.xs,
  },
  recReasoning: {
    fontSize: 11,
    lineHeight: 15,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: "center",
  },
});
