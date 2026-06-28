import type { BaseEntity, ISODateTimeString, UUID } from "./common.js";
import type { NotificationChannel, NotificationStatus, NotificationUrgency } from "./enums.js";

/** Notification record. */
export interface Notification extends BaseEntity {
  readonly userId: UUID;
  readonly type: string;
  readonly urgency: NotificationUrgency;
  readonly title: string;
  readonly body: string;
  readonly relatedTaskId: UUID | null;
  readonly relatedRecommendationId: UUID | null;
  readonly channelsSent: NotificationChannel[];
  readonly status: NotificationStatus;
  readonly readAt: ISODateTimeString | null;
  readonly actedAt: ISODateTimeString | null;
  readonly dismissedAt: ISODateTimeString | null;
}

/** Input for updating notification preferences by urgency. */
export interface UpdateNotificationPreferencesInput {
  readonly low: NotificationChannel[];
  readonly medium: NotificationChannel[];
  readonly high: NotificationChannel[];
  readonly critical: NotificationChannel[];
}
