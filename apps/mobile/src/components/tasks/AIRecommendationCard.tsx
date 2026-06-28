// ─────────────────────────────────────────────────────────────
// LastMinute — AI Recommendation Card Component
// ─────────────────────────────────────────────────────────────

import React from "react";
import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { AIRecommendation, RecommendationSeverity } from "@lastminute/types";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Typography, Card } from "../common";

interface Props {
  recommendation: AIRecommendation;
  onDismiss: () => Promise<void>;
  isDismissing?: boolean;
}

export const AIRecommendationCard: React.FC<Props> = ({
  recommendation,
  onDismiss,
  isDismissing = false,
}) => {
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

  const stylesConfig = getSeverityStyle(recommendation.severity);

  return (
    <Card style={[styles.recCard, { borderColor: stylesConfig.border }]}>
      <View style={styles.recHeader}>
        <Typography variant="caption" style={[styles.severityBadge, { color: stylesConfig.color }]}>
          {recommendation.severity.toUpperCase()} — {recommendation.recommendationType}
        </Typography>
        {isDismissing ? (
          <ActivityIndicator size="small" color={colors.text.secondary} />
        ) : (
          <TouchableOpacity onPress={onDismiss} activeOpacity={0.7} style={styles.dismissBtn}>
            <Typography variant="caption" color={colors.text.secondary}>
              ✕
            </Typography>
          </TouchableOpacity>
        )}
      </View>
      <Typography variant="bodyBold" style={styles.recContent}>
        {recommendation.content}
      </Typography>
      <Typography variant="caption" color={colors.text.secondary} style={styles.recReasoning}>
        Reasoning: {recommendation.reasoning}
      </Typography>
    </Card>
  );
};

const styles = StyleSheet.create({
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
  dismissBtn: {
    padding: spacing.xxs,
  },
  recContent: {
    marginBottom: spacing.xs,
  },
  recReasoning: {
    fontSize: 11,
    lineHeight: 15,
  },
});
