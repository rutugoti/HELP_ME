// ─────────────────────────────────────────────────────────────
// LastMinute — Tasks Stack Navigator
// ─────────────────────────────────────────────────────────────

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "../constants/colors";
import { TasksStackParamList } from "./types";
import {
  TaskListScreen,
  TaskDetailScreen,
  TaskCreateScreen,
  TaskEditScreen,
  TaskDependencyScreen,
  ActionDraftScreen,
} from "../screens/tasks";

const Stack = createNativeStackNavigator<TasksStackParamList>();

export const TasksNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="TaskList"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.primary },
      }}
    >
      <Stack.Screen name="TaskList" component={TaskListScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      <Stack.Screen name="TaskCreate" component={TaskCreateScreen} />
      <Stack.Screen name="TaskEdit" component={TaskEditScreen} />
      <Stack.Screen name="TaskDependency" component={TaskDependencyScreen} />
      <Stack.Screen name="ActionDraft" component={ActionDraftScreen} />
    </Stack.Navigator>
  );
};
