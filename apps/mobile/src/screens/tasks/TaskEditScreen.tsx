// ─────────────────────────────────────────────────────────────
// LastMinute — Task Edit Screen
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TasksStackParamList } from "../../navigation/types";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Typography, Input, Button, Card } from "../../components/common";
import { ConsequenceSeverity, TaskStatus } from "@lastminute/types";
import { UpdateTaskInput } from "@lastminute/schemas";
import { tasksApi } from "@lastminute/api-client";
import { api } from "../../services/api";

type Props = NativeStackScreenProps<TasksStackParamList, "TaskEdit">;

const SEVERITIES = [
  { label: "Low Impact", value: ConsequenceSeverity.Low },
  { label: "Medium Cost", value: ConsequenceSeverity.Medium },
  { label: "High Cost", value: ConsequenceSeverity.High },
  { label: "Critical Impact", value: ConsequenceSeverity.Critical },
];

const STATUSES = [
  { label: "Open", value: TaskStatus.Open },
  { label: "In Progress", value: TaskStatus.InProgress },
  { label: "Completed", value: TaskStatus.Completed },
  { label: "Cancelled", value: TaskStatus.Cancelled },
];

export const TaskEditScreen: React.FC<Props> = ({ route, navigation }) => {
  const { taskId } = route.params;
  const queryClient = useQueryClient();

  const { data: taskRes, isLoading } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => tasksApi.getTask(api, taskId),
  });

  const task = taskRes?.status === "success" ? taskRes.data : null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadlineStr, setDeadlineStr] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState<ConsequenceSeverity>(ConsequenceSeverity.Medium);
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.Open);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setDeadlineStr(task.deadline);
      setEstimatedMinutes(String(task.estimatedMinutes || 30));
      setCategory(task.category);
      setSeverity(task.consequenceSeverity);
      setStatus(task.status);
    }
  }, [task]);

  const updateMutation = useMutation({
    mutationFn: (input: UpdateTaskInput) => tasksApi.updateTask(api, taskId, input),
    onSuccess: (res) => {
      if (res.status === "success") {
        queryClient.invalidateQueries({ queryKey: ["task", taskId] });
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        navigation.goBack();
      } else {
        setErrorText((res.data as unknown as string) || "Validation error");
      }
    },
    onError: (err: Error) => {
      setErrorText(err.message || "Network error");
    },
  });

  const handleUpdate = () => {
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
      consequenceSeverity: severity,
      status,
    };

    updateMutation.mutate(input);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Typography variant="h2" style={styles.header}>
            Edit Task
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
              Status
            </Typography>
            <View style={styles.severityRow}>
              {STATUSES.map((st) => {
                const isSelected = status === st.value;
                return (
                  <Button
                    key={st.value}
                    variant={isSelected ? "primary" : "outline"}
                    title={st.label}
                    onPress={() => setStatus(st.value)}
                    style={styles.sevBtn}
                  />
                );
              })}
            </View>

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
                    title={sev.label.split(" ")[0]}
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
              {updateMutation.isPending ? (
                <ActivityIndicator size="small" color={colors.accent.primary} />
              ) : (
                <Button
                  variant="primary"
                  title="Save"
                  onPress={handleUpdate}
                  style={styles.actionBtn}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    flexWrap: "wrap",
  },
  sevBtn: {
    flex: 1,
    minWidth: 70,
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
