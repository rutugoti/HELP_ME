// ─────────────────────────────────────────────────────────────
// LastMinute — Task List Screen
// ─────────────────────────────────────────────────────────────

import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { TasksStackParamList } from "../../navigation/types";
import { Typography, Card, Button } from "../../components/common";
import { TaskCard, TaskCardSkeleton } from "../../components/tasks";
import { useTasks } from "../../hooks/useTasks";

import { SafeAreaView } from "react-native-safe-area-context";

type Props = NativeStackScreenProps<TasksStackParamList, "TaskList">;

export const TaskListScreen: React.FC<Props> = ({ navigation }) => {
  const { tasks, isLoading, refetch, startTask, completeTask } = useTasks();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Typography variant="h2">My Tasks</Typography>
        <Button
          variant="primary"
          size="sm"
          title="+ Task"
          onPress={() => navigation.navigate("TaskCreate")}
          style={styles.createBtn}
        />
      </View>

      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.flex}>
            <TaskCardSkeleton />
            <TaskCardSkeleton />
          </View>
        ) : tasks.length > 0 ? (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskCard
                task={item}
                onPress={() => navigation.navigate("TaskDetail", { taskId: item.id })}
                onStart={() => startTask(item.id)}
                onComplete={() => completeTask(item.id)}
              />
            )}
            contentContainerStyle={styles.listContent}
            onRefresh={refetch}
            refreshing={isLoading}
          />
        ) : (
          <Card style={styles.emptyCard}>
            <Typography variant="bodyMuted" align="center">
              No tasks found.
            </Typography>
          </Card>
        )}
      </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  createBtn: {
    paddingHorizontal: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: "center",
  },
});
