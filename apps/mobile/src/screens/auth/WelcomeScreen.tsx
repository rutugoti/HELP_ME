// ─────────────────────────────────────────────────────────────
// LastMinute — Welcome Screen
// ─────────────────────────────────────────────────────────────

import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Typography, Button, Card } from "../../components/common";
import { AuthStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Welcome">;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Brand Header */}
        <View style={styles.heroSection}>
          <View style={styles.logoBadge}>
            <Typography variant="mono" color={colors.white} style={styles.logoChar}>
              LM
            </Typography>
          </View>
          <Typography variant="h1" align="center" style={styles.title}>
            LastMinute
          </Typography>
          <Typography variant="bodyMuted" align="center" style={styles.subtitle}>
            Your AI Task Orchestrator & Context Engine. Designed to manage consequences, track
            habits, and protect your calendar.
          </Typography>
        </View>

        {/* Action Options */}
        <Card style={styles.card}>
          <Typography variant="bodyBold" align="center" style={styles.cardHeader}>
            Get Started
          </Typography>
          <Typography variant="caption" align="center" style={styles.cardSub}>
            Select your professional role to build your custom priority scoring model.
          </Typography>

          <Button
            variant="primary"
            title="Create Account"
            onPress={() => navigation.navigate("RoleSelect")}
            style={styles.actionButton}
          />

          <Button
            variant="outline"
            title="Sign In"
            onPress={() => navigation.navigate("Login")}
            style={styles.actionButton}
          />
        </Card>
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
    justifyContent: "space-between",
  },
  heroSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.accent.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoChar: {
    fontSize: 24,
    fontWeight: "800",
  },
  title: {
    marginBottom: spacing.md,
    letterSpacing: -0.5,
  },
  subtitle: {
    paddingHorizontal: spacing.md,
    lineHeight: 22,
  },
  card: {
    marginBottom: spacing.xl,
    padding: spacing.xl,
  },
  cardHeader: {
    fontSize: 18,
    marginBottom: spacing.xs,
  },
  cardSub: {
    marginBottom: spacing.xl,
  },
  actionButton: {
    marginBottom: spacing.md,
    width: "100%",
  },
});
