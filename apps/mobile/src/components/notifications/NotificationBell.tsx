// ─────────────────────────────────────────────────────────────
// LastMinute — Notification Bell Component
// ─────────────────────────────────────────────────────────────

import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Typography } from "../common";
import { NotificationBadge } from "./NotificationBadge";
import { useNotifications } from "../../hooks/useNotifications";
import { useUIStore } from "../../store/uiStore";

export const NotificationBell: React.FC = () => {
  const { unreadCount, fetchNotifications } = useNotifications();
  const { showNotificationOverlay } = useUIStore();

  // Periodically fetch notifications or do it on load
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30s poll
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => showNotificationOverlay(true)}
      style={styles.container}
    >
      <Typography variant="h3">🔔</Typography>
      <NotificationBadge count={unreadCount} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
    position: "relative",
  },
});
