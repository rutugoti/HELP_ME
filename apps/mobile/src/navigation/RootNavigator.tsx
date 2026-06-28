// ─────────────────────────────────────────────────────────────
// LastMinute — Root Navigator
// ─────────────────────────────────────────────────────────────

import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "../store/authStore";
import { LoadingSpinner } from "../components/common";
import { AuthNavigator } from "./AuthNavigator";
import { OnboardingNavigator } from "./OnboardingNavigator";
import { RootStackParamList } from "./types";
import { colors } from "../constants/colors";

// Simple temporary Dashboard screen until AppNavigator is implemented in Session 13
import { Typography, Button } from "../components/common";

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppPlaceholder: React.FC = () => {
  const { logout, user } = useAuthStore();
  return (
    <View style={styles.placeholderContainer}>
      <Typography variant="h2" align="center" style={styles.title}>
        Welcome to LastMinute!
      </Typography>
      <Typography variant="bodyMuted" align="center" style={styles.subtitle}>
        Logged in as: {user?.fullName || "User"} ({user?.email})
      </Typography>
      <Typography variant="caption" align="center" style={styles.info}>
        Your session 12 Auth & Onboarding Flow is complete. Screen 13 will setup the Dashboard.
      </Typography>
      <Button variant="outline" title="Log Out" onPress={logout} style={styles.btn} />
    </View>
  );
};

export const RootNavigator: React.FC = () => {
  const { accessToken, onboardingRequired, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!accessToken ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : onboardingRequired ? (
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      ) : (
        <Stack.Screen name="App" component={AppPlaceholder} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
  },
  info: {
    marginBottom: 32,
    color: colors.text.secondary,
  },
  btn: {
    width: 200,
  },
});
