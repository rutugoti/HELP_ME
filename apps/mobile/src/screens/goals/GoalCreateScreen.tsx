// ─────────────────────────────────────────────────────────────
// LastMinute — Goal Create Screen
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { GoalsStackParamList } from "../../navigation/types";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography, Card, Button } from "../../components/common";
import { useGoals } from "../../hooks/useGoals";

type Props = NativeStackScreenProps<GoalsStackParamList, "GoalCreate">;

const HABIT_CATEGORIES_OPTIONS = ["work", "fitness", "learning", "health", "finance", "social"];

export const GoalCreateScreen: React.FC<Props> = ({ navigation }) => {
  const { createGoal, isCreatingGoal } = useGoals();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDateStr, setTargetDateStr] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [errorText, setErrorText] = useState<string | null>(null);

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setErrorText("Please enter a goal title.");
      return;
    }

    // Basic date parsing validation (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!targetDateStr.trim() || !dateRegex.test(targetDateStr)) {
      setErrorText("Please specify target date in YYYY-MM-DD format.");
      return;
    }

    setErrorText(null);

    try {
      await createGoal({
        title,
        description: description.trim() || undefined,
        targetDate: targetDateStr,
        habitCategories: selectedCategories.length > 0 ? selectedCategories : undefined,
      });
      navigation.navigate("GoalsMain");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create goal.";
      setErrorText(msg);
    }
  };

  // Set default target date helper (e.g. 30 days from now)
  const setQuickTargetDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    setTargetDateStr(`${year}-${month}-${day}`);
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
          Create New Goal
        </Typography>
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {errorText && (
          <Card style={styles.errorCard}>
            <Typography variant="caption" color={colors.priority.critical}>
              ⚠️ {errorText}
            </Typography>
          </Card>
        )}

        <Typography variant="bodyBold" style={styles.label}>
          Goal Title
        </Typography>
        <TextInput
          placeholder="E.g. Run a half marathon, Learn Next.js"
          placeholderTextColor={colors.text.secondary}
          value={title}
          onChangeText={setTitle}
          style={styles.textInput}
        />

        <Typography variant="bodyBold" style={styles.label}>
          Description (Optional)
        </Typography>
        <TextInput
          placeholder="What is your motivation or plan details..."
          placeholderTextColor={colors.text.secondary}
          value={description}
          onChangeText={setDescription}
          style={[styles.textInput, styles.textArea]}
          multiline
        />

        <Typography variant="bodyBold" style={styles.label}>
          Target Date (YYYY-MM-DD)
        </Typography>
        <TextInput
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.text.secondary}
          value={targetDateStr}
          onChangeText={setTargetDateStr}
          style={styles.textInput}
        />

        <View style={styles.quickDatesRow}>
          <TouchableOpacity onPress={() => setQuickTargetDate(30)} style={styles.quickDateTag}>
            <Typography variant="caption">30 days</Typography>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setQuickTargetDate(90)} style={styles.quickDateTag}>
            <Typography variant="caption">90 days</Typography>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setQuickTargetDate(180)} style={styles.quickDateTag}>
            <Typography variant="caption">6 months</Typography>
          </TouchableOpacity>
        </View>

        <Typography variant="bodyBold" style={styles.label}>
          Generate Daily Habits (Optional)
        </Typography>
        <Typography variant="caption" color={colors.text.secondary} style={styles.subLabel}>
          Select categories. The AI assistant will prompt you to complete daily tasks for check-in.
        </Typography>

        <View style={styles.categoriesRow}>
          {HABIT_CATEGORIES_OPTIONS.map((cat) => {
            const isSelected = selectedCategories.includes(cat);
            return (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.7}
                onPress={() => toggleCategory(cat)}
                style={[styles.categoryTag, isSelected && styles.categoryTagSelected]}
              >
                <Typography
                  variant="caption"
                  style={{ color: isSelected ? colors.white : colors.text.primary }}
                >
                  {cat.toUpperCase()}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          variant="primary"
          title="Save Goal"
          onPress={handleSave}
          isLoading={isCreatingGoal}
          style={styles.saveBtn}
        />
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
  errorCard: {
    borderColor: colors.priority.critical,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  subLabel: {
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.background.secondary,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    borderRadius: radii.md,
    color: colors.text.primary,
    padding: spacing.sm,
    height: 44,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  quickDatesRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  quickDateTag: {
    backgroundColor: colors.background.secondary,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  categoriesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  categoryTag: {
    backgroundColor: colors.background.secondary,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
  },
  categoryTagSelected: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  saveBtn: {
    width: "100%",
    marginBottom: spacing.xl,
  },
});
