// ─────────────────────────────────────────────────────────────
// LastMinute — Login Screen
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { StyleSheet, View, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Typography, Button, Input, Card } from "../../components/common";
import { AuthStackParamList } from "../../navigation/types";
import { useAuth } from "../../hooks/useAuth";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login, isLoading, error, setError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    await login({ email, password });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Typography variant="h2" style={styles.title}>
            Welcome Back
          </Typography>
          <Typography variant="bodyMuted">Sign in to access your priority task queue.</Typography>
        </View>

        <Card style={styles.card}>
          <Input
            label="Email Address"
            placeholder="e.g. executive@domain.com"
            value={email}
            onChangeText={(val) => {
              setEmail(val);
              setError(null);
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              setError(null);
            }}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
          />

          <TouchableOpacity
            style={styles.forgotContainer}
            onPress={() => navigation.navigate("ForgotPassword")}
            activeOpacity={0.7}
          >
            <Typography variant="caption" color={colors.accent.primary}>
              Forgot Password?
            </Typography>
          </TouchableOpacity>

          {error && (
            <Typography
              variant="captionMuted"
              color={colors.priority.critical}
              style={styles.errorText}
            >
              {error}
            </Typography>
          )}

          <Button
            variant="primary"
            title="Sign In"
            onPress={handleLogin}
            isLoading={isLoading}
            style={styles.loginButton}
          />
        </Card>

        <View style={styles.footer}>
          <Typography variant="bodyMuted">Don't have an account? </Typography>
          <TouchableOpacity onPress={() => navigation.navigate("RoleSelect")} activeOpacity={0.7}>
            <Typography variant="bodyBold" color={colors.accent.primary}>
              Sign Up
            </Typography>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: "center",
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: "center",
  },
  title: {
    marginBottom: spacing.xs,
  },
  card: {
    padding: spacing.xl,
  },
  forgotContainer: {
    alignSelf: "flex-end",
    marginBottom: spacing.lg,
  },
  errorText: {
    marginBottom: spacing.md,
    textAlign: "center",
  },
  loginButton: {
    width: "100%",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
});
