// ─────────────────────────────────────────────────────────────
// LastMinute — Notification Item Component
// ─────────────────────────────────────────────────────────────

import React from "react";
import { StyleSheet, View } from "react-native";
import { Notification, NotificationStatus } from "@lastminute/types";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography, Card, Button } from "../common";

interface Props {
  notification: Notification;
  onMarkRead: (id: string) => Promise<void>;
  onMarkActed: (id: string) => Promise<void>;
  isProcessingRead?: boolean;
  isProcessingActed?: boolean;
}

export const NotificationItem: React.FC<Props> = ({
  notification,
  onMarkRead,
  onMarkActed,
  isProcessingRead = false,
  isProcessingActed = false,
}) => {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return colors.priority.critical;
      case "high":
        return colors.priority.high;
      case "medium":
        return colors.priority.medium;
      default:
        return colors.priority.low;
    }
  };

  const getUrgencyLabelEmoji = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "🚨 CRITICAL";
      case "high":
        return "⚠️ HIGH";
      case "medium":
        return "⚡ MEDIUM";
      default:
        return "ℹ️ LOW";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "numeric",
    });
  };

  const isUnread = notification.status === NotificationStatus.Delivered;
  const isRead = notification.status === NotificationStatus.Read;
  const isActed = notification.status === NotificationStatus.ActedOn;

  const borderColor = getUrgencyColor(notification.urgency);

  return (
    <Card style={[styles.card, { borderColor }, !isUnread && styles.readCard]}>
      <View style={styles.header}>
        <Typography variant="caption" style={[styles.urgencyText, { color: borderColor }]}>
          {getUrgencyLabelEmoji(notification.urgency)}
        </Typography>
        <Typography variant="captionMuted">{formatDate(notification.createdAt)}</Typography>
      </View>

      <Typography variant="bodyBold" style={styles.title}>
        {notification.title}
      </Typography>

      <Typography variant="caption" color={colors.text.secondary} style={styles.body}>
        {notification.body}
      </Typography>

      <View style={styles.actionContainer}>
        {isUnread && (
          <Button
            variant="primary"
            size="sm"
            title="Mark Read"
            onPress={() => onMarkRead(notification.id)}
            isLoading={isProcessingRead}
            style={styles.actionBtn}
          />
        )}

        {isRead && (notification.relatedTaskId || notification.relatedRecommendationId) && (
          <Button
            variant="outline"
            size="sm"
            title="Mark Acted"
            onPress={() => onMarkActed(notification.id)}
            isLoading={isProcessingActed}
            style={styles.actionBtn}
          />
        )}

        {isActed && (
          <View style={styles.actedBadge}>
            <Typography variant="caption" color={colors.priority.low}>
              ✓ Acted On
            </Typography>
          </View>
        )}

        {!isUnread &&
          !isActed &&
          !(notification.relatedTaskId || notification.relatedRecommendationId) && (
            <View style={styles.readBadge}>
              <Typography variant="captionMuted">Read</Typography>
            </View>
          )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: spacing.sm,
    backgroundColor: colors.background.secondary,
  },
  readCard: {
    opacity: 0.85,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  urgencyText: {
    fontWeight: "700",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 14,
    marginBottom: 4,
  },
  body: {
    marginBottom: spacing.sm,
    lineHeight: 16,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: spacing.xxs,
  },
  actionBtn: {
    height: 28,
    paddingHorizontal: spacing.md,
  },
  actedBadge: {
    backgroundColor: colors.background.secondary,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  readBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
});
