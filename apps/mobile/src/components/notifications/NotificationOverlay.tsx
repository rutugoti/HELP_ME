// ─────────────────────────────────────────────────────────────
// LastMinute — Notification Overlay Modal
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Modal,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Typography, Card } from "../common";
import { NotificationItem } from "./NotificationItem";
import { useNotifications } from "../../hooks/useNotifications";
import { useUIStore } from "../../store/uiStore";

export const NotificationOverlay: React.FC = () => {
  const { notifications, isLoading, fetchNotifications, markAsRead, markAsActed } =
    useNotifications();
  const { notificationOverlayVisible, showNotificationOverlay } = useUIStore();

  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleMarkRead = async (id: string) => {
    setProcessingId(id);
    try {
      await markAsRead(id);
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkActed = async (id: string) => {
    setProcessingId(id);
    try {
      await markAsActed(id);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Modal
      visible={notificationOverlayVisible}
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={() => showNotificationOverlay(false)}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="h3">Notifications</Typography>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => showNotificationOverlay(false)}
            style={styles.closeBtn}
          >
            <Typography variant="bodyBold" color={colors.accent.primary}>
              Close
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.accent.primary}
            />
          }
        >
          {isLoading && !refreshing && notifications.length === 0 ? (
            <ActivityIndicator size="large" color={colors.accent.primary} style={styles.spinner} />
          ) : notifications.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Typography variant="bodyMuted" align="center">
                All caught up! No notifications.
              </Typography>
            </Card>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
                onMarkActed={handleMarkActed}
                isProcessingRead={processingId === notification.id}
                isProcessingActed={processingId === notification.id}
              />
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  spinner: {
    marginVertical: spacing.xl,
  },
  emptyCard: {
    padding: spacing.xl,
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
  },
});
