// ─────────────────────────────────────────────────────────────
// LastMinute — Availability Slot Component
// ─────────────────────────────────────────────────────────────

import React from "react";
import { StyleSheet, View } from "react-native";
import { AvailabilityWindow } from "@lastminute/types";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography, Card, Button } from "../common";

interface Props {
  slot: AvailabilityWindow;
  onBook: () => void;
  isBooking?: boolean;
}

export const AvailabilitySlot: React.FC<Props> = ({ slot, onBook, isBooking = false }) => {
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <Typography variant="bodyBold" style={styles.timeText}>
          🔓 {formatTime(slot.startsAt)} - {formatTime(slot.endsAt)}
        </Typography>
        <Typography variant="captionMuted">⏱️ {slot.durationMinutes} mins free</Typography>
      </View>

      <Button
        variant="primary"
        size="sm"
        title="Book Focus"
        onPress={onBook}
        isLoading={isBooking}
        style={styles.bookBtn}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: spacing.sm,
  },
  content: {
    gap: spacing.xxs,
  },
  timeText: {
    fontSize: 14,
  },
  bookBtn: {
    height: 32,
    paddingHorizontal: spacing.md,
  },
});
