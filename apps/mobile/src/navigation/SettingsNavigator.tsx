// ─────────────────────────────────────────────────────────────
// LastMinute — Settings Stack Navigator
// ─────────────────────────────────────────────────────────────

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "../constants/colors";
import { SettingsStackParamList } from "./types";
import {
  SettingsScreen,
  ProfileScreen,
  NotificationSettingsScreen,
  EscalationSettingsScreen,
  CalendarSettingsScreen,
  PrivacySettingsScreen,
} from "../screens/settings";

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export const SettingsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="SettingsMain"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.primary },
      }}
    >
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="EscalationSettings" component={EscalationSettingsScreen} />
      <Stack.Screen name="CalendarSettings" component={CalendarSettingsScreen} />
      <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
    </Stack.Navigator>
  );
};
