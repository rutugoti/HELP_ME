// ─────────────────────────────────────────────────────────────
// LastMinute — Habit Row / Card Component
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, TextInput } from "react-native";
import { HabitSummary } from "@lastminute/types";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography, Card, Button } from "../common";
import { StreakIndicator } from "./StreakIndicator";

interface Props {
  habit: HabitSummary;
  onLog: (notes?: string, effortRating?: number) => Promise<void>;
  isLogging?: boolean;
}

export const HabitRow: React.FC<Props> = ({ habit, onLog, isLogging = false }) => {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState<number>(3);

  const handleLogSubmit = async () => {
    await onLog(notes || undefined, rating);
    setNotes("");
    setExpanded(false);
  };

  return (
    <Card style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setExpanded(!expanded)}
        style={styles.header}
      >
        <View style={styles.headerInfo}>
          <Typography variant="bodyBold" style={styles.categoryTitle}>
            ⚡ {habit.habitCategory}
          </Typography>
          <Typography variant="captionMuted">
            Streak: {habit.currentStreak} days • Best: {habit.longestStreak} days
          </Typography>
        </View>

        <Button
          variant="outline"
          size="sm"
          title="Log Habit"
          onPress={() => setExpanded(!expanded)}
          style={styles.quickLogBtn}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />

          {/* Streak details */}
          <StreakIndicator
            currentStreak={habit.currentStreak}
            longestStreak={habit.longestStreak}
            hasBehavioralDrift={habit.hasBehavioralDrift}
          />

          {/* Logging Form */}
          <Typography variant="bodyBold" style={styles.formLabel}>
            How was the effort today? (1 - Easy, 5 - Hard)
          </Typography>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((val) => {
              const isSelected = rating === val;
              return (
                <TouchableOpacity
                  key={val}
                  activeOpacity={0.7}
                  onPress={() => setRating(val)}
                  style={[styles.ratingBubble, isSelected && styles.ratingBubbleSelected]}
                >
                  <Typography
                    variant="bodyBold"
                    style={{ color: isSelected ? colors.white : colors.text.primary }}
                  >
                    {val}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>

          <Typography variant="bodyBold" style={styles.formLabel}>
            Notes
          </Typography>
          <TextInput
            placeholder="Add quick notes about your progress today..."
            placeholderTextColor={colors.text.secondary}
            value={notes}
            onChangeText={setNotes}
            style={styles.textInput}
            multiline
          />

          <View style={styles.actionRow}>
            <Button
              variant="outline"
              size="sm"
              title="Cancel"
              onPress={() => setExpanded(false)}
              style={styles.actionBtn}
            />
            <Button
              variant="primary"
              size="sm"
              title="Submit Log"
              onPress={handleLogSubmit}
              isLoading={isLogging}
              style={styles.actionBtn}
            />
          </View>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  categoryTitle: {
    fontSize: 16,
    textTransform: "capitalize",
  },
  quickLogBtn: {
    height: 32,
    paddingHorizontal: spacing.md,
  },
  expandedContent: {
    marginTop: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginBottom: spacing.md,
  },
  formLabel: {
    fontSize: 13,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  ratingRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  ratingBubble: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    backgroundColor: colors.background.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  ratingBubbleSelected: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  textInput: {
    backgroundColor: colors.background.primary,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    borderRadius: radii.md,
    color: colors.text.primary,
    padding: spacing.sm,
    height: 60,
    textAlignVertical: "top",
    marginBottom: spacing.md,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionBtn: {
    width: 100,
    height: 32,
  },
});
