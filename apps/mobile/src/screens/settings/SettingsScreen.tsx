// ─────────────────────────────────────────────────────────────
// LastMinute — Settings Main Screen
// ─────────────────────────────────────────────────────────────

import React from "react";
import { StyleSheet, View, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SettingsStackParamList } from "../../navigation/types";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Typography, Card, Button } from "../../components/common";
import { useAuthStore } from "../../store/authStore";

type Props = NativeStackScreenProps<SettingsStackParamList, "SettingsMain">;

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { logout, user } = useAuthStore();

  const menuItems = [
    {
      title: "👤 Profile & Account",
      description: "Manage name, timezone, and review your assigned role.",
      route: "Profile",
    },
    {
      title: "🔔 Notification Channels",
      description: "Toggle email, push, and SMS channels per urgency levels.",
      route: "NotificationSettings",
    },
    {
      title: "🚨 Escalation Contact",
      description: "Define your consequence advisor name, email, and threshold.",
      route: "EscalationSettings",
    },
    {
      title: "📅 Calendar & Hours",
      description: "Set your daily start/end hours and autonomous scheduling.",
      route: "CalendarSettings",
    },
    {
      title: "🔒 Privacy & Masking",
      description: "Enable task content privacy masking for AI processing.",
      route: "PrivacySettings",
    },
  ] as const;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Typography variant="h2">Settings</Typography>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <Card style={styles.userCard}>
          <View style={styles.avatar}>
            <Typography variant="h2" color={colors.white}>
              {user?.fullName?.charAt(0).toUpperCase() || "U"}
            </Typography>
          </View>
          <View style={styles.userInfo}>
            <Typography variant="bodyBold">{user?.fullName}</Typography>
            <Typography variant="captionMuted">{user?.email}</Typography>
            <Typography variant="caption" color={colors.accent.primary} style={styles.roleTag}>
              ROLE: {user?.role?.toUpperCase()}
            </Typography>
          </View>
        </Card>

        {/* Menu Items */}
        <View style={styles.menu}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(item.route)}
            >
              <Card style={styles.menuCard}>
                <View style={styles.menuContent}>
                  <View style={{ flex: 1 }}>
                    <Typography variant="bodyBold">{item.title}</Typography>
                    <Typography
                      variant="caption"
                      color={colors.text.secondary}
                      style={styles.menuDesc}
                    >
                      {item.description}
                    </Typography>
                  </View>
                  <Typography variant="body" color={colors.accent.primary} style={styles.arrow}>
                    ➔
                  </Typography>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        <Button variant="outline" title="Sign Out" onPress={logout} style={styles.logoutBtn} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  container: {
    padding: spacing.lg,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.accent.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  roleTag: {
    fontWeight: "700",
    marginTop: 2,
  },
  menu: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  menuCard: {
    padding: spacing.md,
    borderColor: colors.border.subtle,
    borderWidth: 1,
  },
  menuContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuDesc: {
    marginTop: 2,
  },
  arrow: {
    marginLeft: spacing.sm,
  },
  logoutBtn: {
    width: "100%",
    borderColor: colors.priority.critical,
    marginBottom: spacing.xl,
  },
});
