// ─────────────────────────────────────────────────────────────
// LastMinute — Availability Settings & Overview Screen
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { CalendarStackParamList } from "../../navigation/types";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Typography, Card, Button } from "../../components/common";
import { useCalendar } from "../../hooks/useCalendar";

type Props = NativeStackScreenProps<CalendarStackParamList, "Availability">;

export const AvailabilityScreen: React.FC<Props> = ({ navigation }) => {
  const { getAvailability } = useCalendar();
  const [minMinutes, setMinMinutes] = useState<number>(30);

  // Get date range for next 7 days
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const startDateStr = formatDate(today);
  const endDateStr = formatDate(nextWeek);

  const {
    data: slots = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["availabilityWeek", startDateStr, endDateStr, minMinutes],
    queryFn: () =>
      getAvailability({
        startDate: startDateStr,
        endDate: endDateStr,
        minimumMinutes: minMinutes,
      }),
  });

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
          Availability Settings
        </Typography>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Typography variant="bodyBold" style={styles.sectionTitle}>
          Minimum Slot Duration
        </Typography>
        <Typography variant="caption" color={colors.text.secondary} style={styles.description}>
          Select the minimum size for focus block windows that you want to schedule.
        </Typography>

        <View style={styles.durationsRow}>
          {[15, 30, 45, 60, 90].map((mins) => {
            const isSelected = minMinutes === mins;
            return (
              <Button
                key={mins}
                variant={isSelected ? "primary" : "outline"}
                title={`${mins}m`}
                onPress={() => setMinMinutes(mins)}
                style={styles.durBtn}
              />
            );
          })}
        </View>

        <Typography variant="bodyBold" style={styles.sectionTitle}>
          7-Day Available Slots
        </Typography>

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.accent.primary} style={styles.spinner} />
        ) : error ? (
          <Card style={styles.errorCard}>
            <Typography variant="caption" color={colors.priority.critical}>
              ⚠️ Failed to load availability: {error.message}
            </Typography>
          </Card>
        ) : slots.length > 0 ? (
          slots.map((slot, index) => (
            <Card key={index} style={styles.slotCard}>
              <View style={styles.slotDetails}>
                <Typography variant="bodyBold">🕒 {formatDateTime(slot.startsAt)}</Typography>
                <Typography variant="captionMuted">
                  Ends:{" "}
                  {new Date(slot.endsAt).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
                <Typography
                  variant="caption"
                  color={colors.accent.primary}
                  style={styles.durationBadge}
                >
                  ⏱️ {slot.durationMinutes} minutes free
                </Typography>
              </View>

              <Button
                variant="primary"
                size="sm"
                title="Book"
                onPress={() =>
                  navigation.navigate("FocusBlock", {
                    startsAt: slot.startsAt,
                    endsAt: slot.endsAt,
                    durationMinutes: slot.durationMinutes,
                  })
                }
                style={styles.bookBtn}
              />
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Typography variant="bodyMuted" align="center">
              No free windows of at least {minMinutes} minutes found for the next 7 days.
            </Typography>
          </Card>
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
    marginRight: spacing.lg,
  },
  container: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 15,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  description: {
    marginBottom: spacing.md,
  },
  durationsRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  durBtn: {
    flex: 1,
    height: 36,
  },
  spinner: {
    marginVertical: spacing.xl,
  },
  errorCard: {
    padding: spacing.md,
    borderColor: colors.priority.critical,
    borderWidth: 1,
  },
  slotCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderColor: colors.border.subtle,
    borderWidth: 1,
  },
  slotDetails: {
    gap: spacing.xxs,
    flex: 1,
  },
  durationBadge: {
    fontWeight: "700",
    marginTop: spacing.xxs,
  },
  bookBtn: {
    height: 32,
    paddingHorizontal: spacing.md,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: "center",
  },
});
