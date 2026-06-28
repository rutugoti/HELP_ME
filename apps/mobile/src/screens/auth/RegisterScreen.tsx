// ─────────────────────────────────────────────────────────────
// LastMinute — Register Screen
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { StyleSheet, View, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Typography, Button, Input, Card } from "../../components/common";
import { AuthStackParamList } from "../../navigation/types";
import { useAuth } from "../../hooks/useAuth";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export const RegisterScreen: React.FC<Props> = ({ route, navigation }) => {
  const { role } = route.params;
  const { register, isLoading, error, setError } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [timezone] = useState("America/New_York"); // Default timezone

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      setError("All fields are required.");
      return;
    }
    await register({
      fullName,
      email,
      password,
      role,
      timezone,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Typography variant="h2" style={styles.title}>
            Create Account
          </Typography>
          <Typography variant="bodyMuted" align="center">
            Set up details for your {role.toUpperCase()} workspace.
          </Typography>
        </View>

        <Card style={styles.card}>
          <Input
            label="Full Name"
            placeholder="e.g. John Doe"
            value={fullName}
            onChangeText={(val) => {
              setFullName(val);
              setError(null);
            }}
            autoComplete="name"
          />

          <Input
            label="Email Address"
            placeholder="e.g. email@domain.com"
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
            placeholder="Choose a strong password"
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              setError(null);
            }}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password-new"
          />

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
            title="Register Account"
            onPress={handleRegister}
            isLoading={isLoading}
            style={styles.registerButton}
          />
        </Card>

        <View style={styles.footer}>
          <Typography variant="bodyMuted">Already have an account? </Typography>
          <TouchableOpacity onPress={() => navigation.navigate("Login")} activeOpacity={0.7}>
            <Typography variant="bodyBold" color={colors.accent.primary}>
              Sign In
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
  errorText: {
    marginBottom: spacing.md,
    textAlign: "center",
  },
  registerButton: {
    width: "100%",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
});
