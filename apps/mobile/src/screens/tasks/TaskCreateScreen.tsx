// ─────────────────────────────────────────────────────────────
// LastMinute — Task Create Screen
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { StyleSheet, View, SafeAreaView, ScrollView, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TasksStackParamList } from "../../navigation/types";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Typography, Input, Button, Card } from "../../components/common";
import { ConsequenceSeverity } from "@lastminute/types";
import { CreateTaskInput } from "@lastminute/schemas";
import { tasksApi } from "@lastminute/api-client";
import { api } from "../../services/api";

type Props = NativeStackScreenProps<TasksStackParamList, "TaskCreate">;

const SEVERITIES = [
  { label: "Low Impact", value: ConsequenceSeverity.Low },
  { label: "Medium Cost", value: ConsequenceSeverity.Medium },
  { label: "High Cost", value: ConsequenceSeverity.High },
  { label: "Critical Impact", value: ConsequenceSeverity.Critical },
];

export const TaskCreateScreen: React.FC<Props> = ({ navigation }) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadlineStr, setDeadlineStr] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  ); // Default to tomorrow
  const [estimatedMinutes, setEstimatedMinutes] = useState("30");
  const [category, setCategory] = useState("Work");
  const [severity, setSeverity] = useState<ConsequenceSeverity>(ConsequenceSeverity.Medium);
  const [errorText, setErrorText] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (input: CreateTaskInput) => tasksApi.createTask(api, input),
    onSuccess: (res) => {
      if (res.status === "success") {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        navigation.navigate("TaskList");
      } else {
        setErrorText((res.data as unknown as string) || "Validation error");
      }
    },
    onError: (err: Error) => {
      setErrorText(err.message || "Network error");
    },
  });

  const handleCreate = () => {
    if (!title.trim()) {
      setErrorText("Title is required");
      return;
    }
    setErrorText(null);

    const input = {
      title,
      description: description.trim() || undefined,
      deadline: deadlineStr,
      estimatedMinutes: parseInt(estimatedMinutes, 10) || undefined,
      category,
      consequenceSeverityOverride: severity,
    };

    createMutation.mutate(input);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Typography variant="h2" style={styles.header}>
          New Task
        </Typography>

        {errorText && (
          <Card style={styles.errorCard}>
            <Typography variant="caption" color={colors.priority.critical}>
              ⚠️ {errorText}
            </Typography>
          </Card>
        )}

        <View style={styles.form}>
          <Input
            label="Task Title"
            placeholder="What needs to be done?"
            value={title}
            onChangeText={setTitle}
          />

          <Input
            label="Description"
            placeholder="Optional details, links, scripts..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />

          <Input
            label="Deadline (ISO format)"
            placeholder="YYYY-MM-DDTHH:MM:SSZ"
            value={deadlineStr}
            onChangeText={setDeadlineStr}
          />

          <Input
            label="Estimated Effort (Minutes)"
            placeholder="e.g. 30"
            value={estimatedMinutes}
            onChangeText={setEstimatedMinutes}
            keyboardType="number-pad"
          />

          <Input
            label="Category"
            placeholder="e.g. Work, Admin, Health"
            value={category}
            onChangeText={setCategory}
          />

          <Typography variant="caption" style={styles.label}>
            Consequence Severity
          </Typography>
          <View style={styles.severityRow}>
            {SEVERITIES.map((sev) => {
              const isSelected = severity === sev.value;
              return (
                <Button
                  key={sev.value}
                  variant={isSelected ? "primary" : "outline"}
                  title={sev.label.split(" ")[0]} // Short label
                  onPress={() => setSeverity(sev.value)}
                  style={styles.sevBtn}
                />
              );
            })}
          </View>

          <View style={styles.actions}>
            <Button
              variant="outline"
              title="Cancel"
              onPress={() => navigation.goBack()}
              style={styles.actionBtn}
            />
            {createMutation.isPending ? (
              <ActivityIndicator size="small" color={colors.accent.primary} />
            ) : (
              <Button
                variant="primary"
                title="Create"
                onPress={handleCreate}
                style={styles.actionBtn}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  errorCard: {
    borderColor: colors.priority.critical,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  form: {
    gap: spacing.md,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  label: {
    fontWeight: "700",
    marginBottom: -spacing.sm,
  },
  severityRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  sevBtn: {
    flex: 1,
    height: 36,
  },
  sevBtnText: {
    fontSize: 11,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
  },
  actionBtn: {
    width: "45%",
  },
});
