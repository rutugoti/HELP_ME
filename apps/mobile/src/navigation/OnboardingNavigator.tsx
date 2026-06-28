// ─────────────────────────────────────────────────────────────
// LastMinute — Onboarding Stack Navigator
// ─────────────────────────────────────────────────────────────

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "../constants/colors";
import { OnboardingStackParamList } from "./types";

// Screens
import { OnboardingScreen } from "../screens/onboarding/OnboardingScreen";
import { CalendarConnectScreen } from "../screens/onboarding/CalendarConnectScreen";
import { WorkingHoursScreen } from "../screens/onboarding/WorkingHoursScreen";
import { NotificationPermissionScreen } from "../screens/onboarding/NotificationPermissionScreen";

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="OnboardingIntro"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.primary },
      }}
    >
      <Stack.Screen name="OnboardingIntro" component={OnboardingScreen} />
      <Stack.Screen name="CalendarConnect" component={CalendarConnectScreen} />
      <Stack.Screen name="WorkingHours" component={WorkingHoursScreen} />
      <Stack.Screen name="NotificationPermission" component={NotificationPermissionScreen} />
    </Stack.Navigator>
  );
};
