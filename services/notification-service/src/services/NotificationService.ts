// ─────────────────────────────────────────────────────────────
// LastMinute — Notification Service Business Logic
// Multi-channel delivery, CRUD, and status tracking per Architecture.md.
// ─────────────────────────────────────────────────────────────

import { NotificationStatus, NotificationUrgency, NotificationChannel } from "@lastminute/types";
import type { Notification, UpdateNotificationPreferencesInput } from "@lastminute/types";
import type {
  INotificationRepository,
  INotificationPreferencesRepository,
} from "../repositories/interfaces.js";
import { NotFoundError } from "../utils/errors.js";
import { logger } from "../config/logger.js";

export interface DeliverNotificationInput {
  userId: string;
  type: string;
  urgency: NotificationUrgency;
  title: string;
  body: string;
  relatedTaskId?: string | null;
  relatedRecommendationId?: string | null;
}

export class NotificationService {
  constructor(
    private readonly notifRepo: INotificationRepository,
    private readonly prefsRepo: INotificationPreferencesRepository
  ) {}

  /**
   * Lists all notifications for a user, sorted by timestamp descending.
   */
  async listNotifications(userId: string): Promise<Notification[]> {
    return this.notifRepo.listForUser(userId);
  }

  /**
   * Marks a notification as read.
   */
  async markRead(notificationId: string, userId: string): Promise<void> {
    const notif = await this.notifRepo.findById(notificationId, userId);
    if (!notif) {
      throw new NotFoundError("Notification not found.");
    }
    await this.notifRepo.markRead(notificationId, userId);
    logger.info("Notification marked as read", { notificationId, userId });
  }

  /**
   * Marks a notification as acted-on (separate from read per Api.md).
   */
  async markActed(notificationId: string, userId: string): Promise<void> {
    const notif = await this.notifRepo.findById(notificationId, userId);
    if (!notif) {
      throw new NotFoundError("Notification not found.");
    }
    await this.notifRepo.markActed(notificationId, userId);
    logger.info("Notification marked as acted-on", { notificationId, userId });
  }

  /**
   * Updates notification channel preferences per urgency level.
   */
  async updatePreferences(
    userId: string,
    prefs: UpdateNotificationPreferencesInput
  ): Promise<void> {
    await this.prefsRepo.updatePreferences(userId, prefs);
    logger.info("Notification preferences updated", { userId });
  }

  /**
   * Gets notification channel preferences.
   */
  async getPreferences(userId: string): Promise<UpdateNotificationPreferencesInput> {
    const prefs = await this.prefsRepo.getPreferences(userId);
    if (!prefs) {
      // Return defaults per Architecture.md rules
      return {
        low: [NotificationChannel.InApp],
        medium: [NotificationChannel.Push],
        high: [NotificationChannel.Push, NotificationChannel.Email],
        critical: [
          NotificationChannel.InApp,
          NotificationChannel.Push,
          NotificationChannel.Email,
          NotificationChannel.Sms,
        ],
      };
    }
    return prefs;
  }

  /**
   * Delivers a notification through the appropriate channels based on urgency
   * and user preferences per Architecture.md:
   *   Low → in-app feed
   *   Medium → push notification
   *   High → push + email
   *   Critical → all channels + escalation if configured
   */
  async deliverNotification(input: DeliverNotificationInput): Promise<Notification> {
    // 1. Resolve channels from user preferences
    const prefs = await this.getPreferences(input.userId);
    let channels: NotificationChannel[];

    switch (input.urgency) {
      case NotificationUrgency.Low:
        channels = prefs.low;
        break;
      case NotificationUrgency.Medium:
        channels = prefs.medium;
        break;
      case NotificationUrgency.High:
        channels = prefs.high;
        break;
      case NotificationUrgency.Critical:
        channels = prefs.critical;
        break;
      default:
        channels = [NotificationChannel.InApp];
    }

    // 2. Dispatch to each channel
    for (const channel of channels) {
      await this.dispatchToChannel(channel, input);
    }

    // 3. Persist notification record
    const notification = await this.notifRepo.create({
      userId: input.userId,
      type: input.type,
      urgency: input.urgency,
      title: input.title,
      body: input.body,
      relatedTaskId: input.relatedTaskId ?? null,
      relatedRecommendationId: input.relatedRecommendationId ?? null,
      channelsSent: channels,
      status: NotificationStatus.Delivered,
      readAt: null,
      actedAt: null,
      dismissedAt: null,
    });

    logger.info("Notification delivered via multi-channel", {
      notificationId: notification.id,
      userId: input.userId,
      urgency: input.urgency,
      channels,
    });

    return notification;
  }

  /**
   * Dispatches a notification to a specific channel.
   * Each channel handler is a pluggable adapter; currently simulated with logging.
   */
  private async dispatchToChannel(
    channel: NotificationChannel,
    input: DeliverNotificationInput
  ): Promise<void> {
    switch (channel) {
      case NotificationChannel.InApp:
        logger.info("Dispatched to in-app feed", {
          userId: input.userId,
          title: input.title,
        });
        break;

      case NotificationChannel.Push:
        // In production: call Expo Push Notification API / AWS SNS
        logger.info("Dispatched push notification", {
          userId: input.userId,
          title: input.title,
        });
        break;

      case NotificationChannel.Email:
        // In production: call SES / SendGrid / Resend
        logger.info("Dispatched email notification", {
          userId: input.userId,
          title: input.title,
        });
        break;

      case NotificationChannel.Sms:
        // In production: call Twilio / AWS SNS
        logger.info("Dispatched SMS notification", {
          userId: input.userId,
          title: input.title,
        });
        break;

      default:
        logger.warn("Unknown notification channel encountered", {
          channel,
          userId: input.userId,
        });
    }
  }
}
