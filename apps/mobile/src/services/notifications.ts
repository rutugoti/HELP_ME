// ─────────────────────────────────────────────────────────────
// LastMinute — Push Notification Service
// Handles Expo push notification registration, permission
// requests, and foreground/background listener setup.
// ─────────────────────────────────────────────────────────────

import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// ── Configuration ─────────────────────────────────────────

/** Set default handler for notifications received while app is foregrounded. */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ── Types ─────────────────────────────────────────────────

export type NotificationListener = (notification: Notifications.Notification) => void;

export type NotificationResponseListener = (response: Notifications.NotificationResponse) => void;

// ── Registration ──────────────────────────────────────────

/** Requests push notification permission and returns the Expo push token. */
export async function registerForPushNotifications(): Promise<string | null> {
  const isExpoGo = Constants.executionEnvironment === "storeClient";
  if (isExpoGo) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  // Android requires a notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#7B61FF",
    });
  }

  const tokenResponse = await Notifications.getExpoPushTokenAsync();
  return tokenResponse.data;
}

// ── Listeners ─────────────────────────────────────────────

/**
 * Subscribes to foreground notifications.
 * Returns a subscription object — call `.remove()` to unsubscribe.
 */
export function onForegroundNotification(
  listener: NotificationListener
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(listener);
}

/**
 * Subscribes to notification taps (foreground + background).
 * Returns a subscription object — call `.remove()` to unsubscribe.
 */
export function onNotificationResponse(
  listener: NotificationResponseListener
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(listener);
}

// ── Badge Management ──────────────────────────────────────

/** Sets the app badge count (iOS). */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/** Clears the app badge. */
export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}

// ── Local Notifications ───────────────────────────────────

/** Schedules an immediate local notification. */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: { title, body, data },
    trigger: null, // immediate
  });
}

/** Cancels all scheduled local notifications. */
export async function cancelAllScheduled(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
