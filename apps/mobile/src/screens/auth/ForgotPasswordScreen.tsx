// ─────────────────────────────────────────────────────────────
// LastMinute — Forgot Password Screen
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { StyleSheet, View, SafeAreaView, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Typography, Button, Input, Card } from "../../components/common";
import { AuthStackParamList } from "../../navigation/types";
import { useAuth } from "../../hooks/useAuth";

type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { requestPasswordReset, isLoading, error, setError } = useAuth();
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRequest = async () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    const isOk = await requestPasswordReset(email);
    if (isOk) {
      setSuccess(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Typography variant="h2" style={styles.title}>
            Forgot Password
          </Typography>
          <Typography variant="bodyMuted" align="center">
            {success
              ? "Check your inbox for a recovery link."
              : "Enter your account email to receive a password reset link."}
          </Typography>
        </View>

        <Card style={styles.card}>
          {success ? (
            <View style={styles.successContainer}>
              <Typography variant="body" align="center" style={styles.successMessage}>
                We've sent reset instructions to {email}.
              </Typography>
              <Button
                variant="primary"
                title="Back to Login"
                onPress={() => navigation.navigate("Login")}
                style={styles.actionButton}
              />
            </View>
          ) : (
            <View>
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
                title="Send Reset Link"
                onPress={handleRequest}
                isLoading={isLoading}
                style={styles.actionButton}
              />
            </View>
          )}
        </Card>

        {!success && (
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Typography variant="bodyBold" color={colors.text.secondary}>
              Back to Sign In
            </Typography>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
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
  successContainer: {
    alignItems: "center",
  },
  successMessage: {
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  errorText: {
    marginBottom: spacing.md,
    textAlign: "center",
  },
  actionButton: {
    width: "100%",
  },
  backLink: {
    alignSelf: "center",
    marginTop: spacing.xl,
  },
});
