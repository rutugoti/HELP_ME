// ─────────────────────────────────────────────────────────────
// LastMinute — Focus Block Card Component
// ─────────────────────────────────────────────────────────────

import React from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { FocusBlock, FocusBlockStatus } from "@lastminute/types";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography, Card, Button } from "../common";

interface Props {
  block: FocusBlock;
  taskTitle: string;
  onCancel: () => Promise<void>;
  isCancelling?: boolean;
}

export const FocusBlockCard: React.FC<Props> = ({
  block,
  taskTitle,
  onCancel,
  isCancelling = false,
}) => {
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: FocusBlockStatus) => {
    switch (status) {
      case FocusBlockStatus.Booked:
      case FocusBlockStatus.Confirmed:
        return colors.priority.low;
      case FocusBlockStatus.Pending:
        return colors.accent.primary;
      case FocusBlockStatus.Cancelled:
      default:
        return colors.text.secondary;
    }
  };

  const statusColor = getStatusColor(block.status);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.timeBadge}>
          <Typography variant="bodyBold" color={colors.white}>
            {formatTime(block.startsAt)} - {formatTime(block.endsAt)}
          </Typography>
        </View>

        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <Typography variant="caption" style={{ color: statusColor, fontWeight: "700" }}>
            {block.status.toUpperCase()}
          </Typography>
        </View>
      </View>

      <Typography variant="bodyBold" style={styles.taskTitle}>
        🎯 {taskTitle}
      </Typography>

      <View style={styles.footer}>
        <Typography variant="captionMuted">
          ⏱️ {block.durationMinutes} mins
          {block.bookedAutonomously && " • Autonomous"}
        </Typography>

        {(block.status === FocusBlockStatus.Booked ||
          block.status === FocusBlockStatus.Confirmed) &&
          (isCancelling ? (
            <ActivityIndicator size="small" color={colors.priority.critical} />
          ) : (
            <Button
              variant="outline"
              size="sm"
              title="Cancel Block"
              onPress={onCancel}
              style={styles.cancelBtn}
            />
          ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderColor: colors.border.subtle,
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  timeBadge: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
  },
  taskTitle: {
    fontSize: 15,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cancelBtn: {
    height: 28,
    borderColor: colors.priority.critical,
  },
});
