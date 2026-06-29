// ─────────────────────────────────────────────────────────────
// LastMinute — Role Select Screen
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography, Button } from "../../components/common";
import { AuthStackParamList } from "../../navigation/types";
import { roles, roleKeys } from "../../constants/roles";
import { UserRole } from "@lastminute/types";

type Props = NativeStackScreenProps<AuthStackParamList, "RoleSelect">;

export const RoleSelectScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.Professional);

  const handleNext = () => {
    navigation.navigate("Register", { role: selectedRole });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Typography variant="h2" style={styles.title}>
            Select Your Role
          </Typography>
          <Typography variant="bodyMuted" align="center">
            Your role defines the baseline consequence weightings for priority task scoring.
          </Typography>
        </View>

        <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
          {roleKeys.map((key) => {
            const role = roles[key];
            const isSelected = selectedRole === key;
            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.8}
                onPress={() => setSelectedRole(key)}
                style={[styles.roleCard, isSelected && styles.roleCardSelected]}
              >
                <View style={styles.cardHeaderRow}>
                  <Typography
                    variant="bodyBold"
                    color={isSelected ? colors.white : colors.text.primary}
                  >
                    {role.label}
                  </Typography>
                  <View
                    style={[
                      styles.weightBadge,
                      {
                        backgroundColor: isSelected
                          ? colors.accent.primary
                          : colors.background.tertiary,
                      },
                    ]}
                  >
                    <Typography variant="caption" style={styles.weightText}>
                      Weight: {role.defaultConsequenceWeight}
                    </Typography>
                  </View>
                </View>
                <Typography variant="caption" style={styles.description}>
                  {role.description}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            variant="primary"
            title="Next Step"
            onPress={handleNext}
            style={styles.nextButton}
          />
        </View>
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
  },
  header: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    alignItems: "center",
  },
  title: {
    marginBottom: spacing.xs,
  },
  scrollList: {
    paddingBottom: spacing.lg,
  },
  roleCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  roleCardSelected: {
    borderColor: colors.border.focus,
    borderWidth: 1.5,
    backgroundColor: colors.background.input,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  weightBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.sm,
  },
  weightText: {
    fontSize: 11,
    fontWeight: "600",
  },
  description: {
    color: colors.text.secondary,
    lineHeight: 18,
  },
  footer: {
    paddingVertical: spacing.md,
  },
  nextButton: {
    width: "100%",
  },
});
