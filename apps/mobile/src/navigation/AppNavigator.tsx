// ─────────────────────────────────────────────────────────────
// LastMinute — Bottom Tab App Navigator
// ─────────────────────────────────────────────────────────────

import React from "react";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { Typography } from "../components/common";
import { AppTabParamList } from "./types";

// Navigators
import { DashboardNavigator } from "./DashboardNavigator";
import { TasksNavigator } from "./TasksNavigator";
import { CalendarNavigator } from "./CalendarNavigator";
import { GoalsNavigator } from "./GoalsNavigator";
import { SettingsNavigator } from "./SettingsNavigator";

import { NotificationOverlay } from "../components/notifications";

const Tab = createBottomTabNavigator<AppTabParamList>();

export const AppNavigator: React.FC = () => {
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
            height: 60,
            paddingBottom: spacing.sm,
            paddingTop: spacing.xs,
          },
        }}
      >
        <Tab.Screen
          name="DashboardTab"
          component={DashboardNavigator}
          options={{
            tabBarLabel: "Dashboard",
            tabBarIcon: ({ color }) => (
              <Typography variant="bodyBold" style={{ color }}>
                📊
              </Typography>
            ),
          }}
        />
        <Tab.Screen
          name="TasksTab"
          component={TasksNavigator}
          options={{
            tabBarLabel: "Tasks",
            tabBarIcon: ({ color }) => (
              <Typography variant="bodyBold" style={{ color }}>
                ⚡
              </Typography>
            ),
          }}
        />
        <Tab.Screen
          name="CalendarTab"
          component={CalendarNavigator}
          options={{
            tabBarLabel: "Calendar",
            tabBarIcon: ({ color }) => (
              <Typography variant="bodyBold" style={{ color }}>
                📅
              </Typography>
            ),
          }}
        />
        <Tab.Screen
          name="GoalsTab"
          component={GoalsNavigator}
          options={{
            tabBarLabel: "Goals",
            tabBarIcon: ({ color }) => (
              <Typography variant="bodyBold" style={{ color }}>
                🎯
              </Typography>
            ),
          }}
        />
        <Tab.Screen
          name="SettingsTab"
          component={SettingsNavigator}
          options={{
            tabBarLabel: "Settings",
            tabBarIcon: ({ color }) => (
              <Typography variant="bodyBold" style={{ color }}>
                ⚙️
              </Typography>
            ),
          }}
        />
      </Tab.Navigator>
      <NotificationOverlay />
    </View>
  );
};
