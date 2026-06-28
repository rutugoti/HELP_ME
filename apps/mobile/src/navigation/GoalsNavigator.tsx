// ─────────────────────────────────────────────────────────────
// LastMinute — Goals Stack Navigator
// ─────────────────────────────────────────────────────────────

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "../constants/colors";
import { GoalsStackParamList } from "./types";
import {
  GoalsScreen,
  GoalDetailScreen,
  GoalCreateScreen,
  HabitTrackerScreen,
} from "../screens/goals";

const Stack = createNativeStackNavigator<GoalsStackParamList>();

export const GoalsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="GoalsMain"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.primary },
      }}
    >
      <Stack.Screen name="GoalsMain" component={GoalsScreen} />
      <Stack.Screen name="GoalDetail" component={GoalDetailScreen} />
      <Stack.Screen name="GoalCreate" component={GoalCreateScreen} />
      <Stack.Screen name="HabitTracker" component={HabitTrackerScreen} />
    </Stack.Navigator>
  );
};
