// ─────────────────────────────────────────────────────────────
// LastMinute — Bottom Tab App Navigator
// ─────────────────────────────────────────────────────────────

import React from "react";
import { StyleSheet, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { Typography, Button } from "../components/common";
import { AppTabParamList } from "./types";
import { useAuthStore } from "../store/authStore";

// Navigators
import { DashboardNavigator } from "./DashboardNavigator";
import { TasksNavigator } from "./TasksNavigator";
import { CalendarNavigator } from "./CalendarNavigator";

const Tab = createBottomTabNavigator<AppTabParamList>();

// Placeholders for Goals and Settings
const GoalsPlaceholder: React.FC = () => (
  <View style={styles.centered}>
    <Typography variant="h3">Goals & Habits</Typography>
    <Typography variant="caption" color={colors.text.secondary} style={styles.text}>
      Goal definitions and habits tracking will be built in Session 16.
    </Typography>
  </View>
);

const SettingsPlaceholder: React.FC = () => {
  const { logout, user } = useAuthStore();
  return (
    <View style={styles.centered}>
      <Typography variant="h3">Settings & Profile</Typography>
      <Typography variant="caption" color={colors.text.secondary} style={styles.text}>
        Signed in as: {user?.fullName} ({user?.email})
      </Typography>
      <Button variant="outline" title="Log Out" onPress={logout} style={styles.logoutBtn} />
    </View>
  );
};

export const AppNavigator: React.FC = () => {
  return (
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
        component={GoalsPlaceholder}
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
        component={SettingsPlaceholder}
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
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  text: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    textAlign: "center",
  },
  logoutBtn: {
    width: 150,
  },
});
