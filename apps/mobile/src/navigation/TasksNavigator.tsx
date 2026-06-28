// ─────────────────────────────────────────────────────────────
// LastMinute — Tasks Stack Navigator
// ─────────────────────────────────────────────────────────────

import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { TasksStackParamList } from "./types";
import { Typography, Card, Button } from "../components/common";
import { TaskCard, TaskCardSkeleton } from "../components/tasks";
import { useTasks } from "../hooks/useTasks";

const Stack = createNativeStackNavigator<TasksStackParamList>();

type TaskListProps = NativeStackScreenProps<TasksStackParamList, "TaskList">;
type TaskDetailProps = NativeStackScreenProps<TasksStackParamList, "TaskDetail">;
type TaskCreateProps = NativeStackScreenProps<TasksStackParamList, "TaskCreate">;
type TaskEditProps = NativeStackScreenProps<TasksStackParamList, "TaskEdit">;

// Functional task list screen placeholder for now
const TaskListPlaceholder: React.FC<TaskListProps> = ({ navigation }) => {
  const { tasks, isLoading, refetch, startTask, completeTask } = useTasks();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h2">My Tasks</Typography>
        <Button
          variant="primary"
          title="+ Task"
          onPress={() => navigation.navigate("TaskCreate")}
          style={styles.createBtn}
        />
      </View>

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
  );
};

const TaskDetailPlaceholder: React.FC<TaskDetailProps> = ({ route, navigation }) => {
  const { taskId } = route.params;
  return (
    <View style={styles.centered}>
      <Typography variant="h3">Task Details</Typography>
      <Typography variant="caption" color={colors.text.secondary} style={styles.spacer}>
        Task ID: {taskId}
      </Typography>
      <Button variant="outline" title="Back" onPress={() => navigation.goBack()} />
    </View>
  );
};

const TaskCreatePlaceholder: React.FC<TaskCreateProps> = ({ navigation }) => {
  return (
    <View style={styles.centered}>
      <Typography variant="h3">Create New Task</Typography>
      <Typography variant="caption" color={colors.text.secondary} style={styles.spacer}>
        Form layout will be implemented in Session 14.
      </Typography>
      <Button variant="outline" title="Back" onPress={() => navigation.goBack()} />
    </View>
  );
};

const TaskEditPlaceholder: React.FC<TaskEditProps> = ({ route, navigation }) => {
  const { taskId } = route.params;
  return (
    <View style={styles.centered}>
      <Typography variant="h3">Edit Task</Typography>
      <Typography variant="caption" color={colors.text.secondary} style={styles.spacer}>
        Task ID: {taskId}
      </Typography>
      <Button variant="outline" title="Back" onPress={() => navigation.goBack()} />
    </View>
  );
};

export const TasksNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="TaskList"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.primary },
      }}
    >
      <Stack.Screen name="TaskList" component={TaskListPlaceholder} />
      <Stack.Screen name="TaskDetail" component={TaskDetailPlaceholder} />
      <Stack.Screen name="TaskCreate" component={TaskCreatePlaceholder} />
      <Stack.Screen name="TaskEdit" component={TaskEditPlaceholder} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.lg,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  createBtn: {
    paddingHorizontal: spacing.md,
    height: 36,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: "center",
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  spacer: {
    marginVertical: spacing.md,
  },
});
