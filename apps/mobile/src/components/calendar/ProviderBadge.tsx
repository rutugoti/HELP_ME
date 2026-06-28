// ─────────────────────────────────────────────────────────────
// LastMinute — Calendar Provider Badge Component
// ─────────────────────────────────────────────────────────────

import React from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { CalendarProviderPublic, SyncStatus } from "@lastminute/types";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography, Button } from "../common";

interface Props {
  provider: CalendarProviderPublic;
  onDisconnect: () => Promise<void>;
  isDisconnecting?: boolean;
}

export const ProviderBadge: React.FC<Props> = ({
  provider,
  onDisconnect,
  isDisconnecting = false,
}) => {
  const getStatusColor = (status: SyncStatus) => {
    switch (status) {
      case SyncStatus.Active:
        return colors.priority.low; // green-ish
      case SyncStatus.Error:
        return colors.priority.high; // orange/red
      case SyncStatus.Disconnected:
      default:
        return colors.text.secondary;
    }
  };

  const statusColor = getStatusColor(provider.syncStatus);

  return (
    <View style={styles.container}>
      <View style={styles.logoCol}>
        <Typography variant="bodyBold" style={styles.providerName}>
          {provider.provider === "google" ? "🟢 Google Calendar" : "🔵 Outlook"}
        </Typography>
        <Typography variant="caption" color={colors.text.secondary}>
          {provider.providerAccountId}
        </Typography>
      </View>

      <View style={styles.statusCol}>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <Typography variant="caption" style={{ color: statusColor, fontWeight: "700" }}>
            {provider.syncStatus.toUpperCase()}
          </Typography>
        </View>

        {isDisconnecting ? (
          <ActivityIndicator size="small" color={colors.text.secondary} />
        ) : (
          <Button
            variant="outline"
            size="sm"
            title="Disconnect"
            onPress={onDisconnect}
            style={styles.disconnectBtn}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: spacing.sm,
  },
  logoCol: {
    flex: 1,
    gap: spacing.xxs,
  },
  providerName: {
    fontSize: 14,
    textTransform: "capitalize",
  },
  statusCol: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
  },
  disconnectBtn: {
    height: 28,
    paddingHorizontal: spacing.sm,
  },
});
