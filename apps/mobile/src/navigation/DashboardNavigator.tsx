// ─────────────────────────────────────────────────────────────
// LastMinute — Dashboard Stack Navigator
// ─────────────────────────────────────────────────────────────

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "../constants/colors";
import { DashboardStackParamList } from "./types";

// Screens
import { DashboardScreen } from "../screens/dashboard/DashboardScreen";
import { PriorityListScreen } from "../screens/dashboard/PriorityListScreen";
import { DailyBriefScreen } from "../screens/dashboard/DailyBriefScreen";
import { InsightsScreen, ProductivityStatsScreen, BehaviorReportScreen } from "../screens/insights";

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export const DashboardNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.primary },
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="PriorityList" component={PriorityListScreen} />
      <Stack.Screen name="DailyBrief" component={DailyBriefScreen} />
      <Stack.Screen name="Insights" component={InsightsScreen} />
      <Stack.Screen name="ProductivityStats" component={ProductivityStatsScreen} />
      <Stack.Screen name="BehaviorReport" component={BehaviorReportScreen} />
    </Stack.Navigator>
  );
};
