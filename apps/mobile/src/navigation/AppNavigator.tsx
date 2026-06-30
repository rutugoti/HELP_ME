// ─────────────────────────────────────────────────────────────
// LastMinute — Bottom Tab App Navigator
// ─────────────────────────────────────────────────────────────

import React from "react";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { AppTabParamList } from "./types";

// Navigators
import { DashboardNavigator } from "./DashboardNavigator";
import { TasksNavigator } from "./TasksNavigator";
import { CalendarNavigator } from "./CalendarNavigator";
import { GoalsNavigator } from "./GoalsNavigator";
import { SettingsNavigator } from "./SettingsNavigator";

import { NotificationOverlay } from "../components/notifications";

import { useSafeAreaInsets } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator<AppTabParamList>();

export const AppNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const hasBottomInset = insets.bottom > 0;

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        initialRouteName="DashboardTab"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.accent.primary,
          tabBarInactiveTintColor: colors.text.secondary,
          tabBarStyle: {
            backgroundColor: colors.background.secondary,
            borderTopColor: colors.border.subtle,
            height: hasBottomInset ? 52 + insets.bottom : 60,
            paddingBottom: hasBottomInset ? insets.bottom : spacing.sm,
            paddingTop: spacing.xs,
          },
        }}
      >
        <Tab.Screen
          name="DashboardTab"
          component={DashboardNavigator}
          options={{
            tabBarLabel: "Dashboard",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="stats-chart" size={size || 24} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="TasksTab"
          component={TasksNavigator}
          options={{
            tabBarLabel: "Tasks",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="flash" size={size || 24} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="CalendarTab"
          component={CalendarNavigator}
          options={{
            tabBarLabel: "Calendar",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar" size={size || 24} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="GoalsTab"
          component={GoalsNavigator}
          options={{
            tabBarLabel: "Goals",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="trophy" size={size || 24} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="SettingsTab"
          component={SettingsNavigator}
          options={{
            tabBarLabel: "Settings",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings" size={size || 24} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
      <NotificationOverlay />
    </View>
  );
};
