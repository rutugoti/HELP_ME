// ─────────────────────────────────────────────────────────────
// LastMinute — Calendar Stack Navigator
// ─────────────────────────────────────────────────────────────

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "../constants/colors";
import { CalendarStackParamList } from "./types";
import { CalendarScreen, FocusBlockScreen, AvailabilityScreen } from "../screens/calendar";

const Stack = createNativeStackNavigator<CalendarStackParamList>();

export const CalendarNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="CalendarMain"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.primary },
      }}
    >
      <Stack.Screen name="CalendarMain" component={CalendarScreen} />
      <Stack.Screen name="FocusBlock" component={FocusBlockScreen} />
      <Stack.Screen name="Availability" component={AvailabilityScreen} />
    </Stack.Navigator>
  );
};
