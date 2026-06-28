// ─────────────────────────────────────────────────────────────
// LastMinute — Calendar Strip Component
// ─────────────────────────────────────────────────────────────

import React from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography } from "../common";

interface Props {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export const CalendarStrip: React.FC<Props> = ({ selectedDate, onSelectDate }) => {
  // Generate next 14 days
  const dates: Date[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  for (let i = 0; i < 14; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString(undefined, { weekday: "short" });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {dates.map((date, idx) => {
          const isSelected = isSameDay(date, selectedDate);
          return (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.7}
              onPress={() => onSelectDate(date)}
              style={[styles.dayCard, isSelected && styles.dayCardSelected]}
            >
              <Typography
                variant="caption"
                style={[styles.dayOfWeek, isSelected && styles.textSelected]}
              >
                {getDayName(date)}
              </Typography>
              <Typography
                variant="bodyBold"
                style={[styles.dayOfMonth, isSelected && styles.textSelected]}
              >
                {date.getDate()}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  dayCard: {
    width: 52,
    height: 64,
    borderRadius: radii.md,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xxs,
  },
  dayCardSelected: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  dayOfWeek: {
    fontSize: 10,
    textTransform: "uppercase",
    fontWeight: "700",
    color: colors.text.secondary,
  },
  dayOfMonth: {
    fontSize: 16,
    color: colors.text.primary,
  },
  textSelected: {
    color: colors.white,
  },
});
