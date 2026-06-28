import type { BaseEntity, ISODateTimeString, UUID } from "./common.js";
import type { CalendarProviderType, FocusBlockStatus, SyncStatus } from "./enums.js";

/** OAuth credentials and sync state for a connected calendar provider. */
export interface CalendarProvider extends BaseEntity {
  readonly userId: UUID;
  readonly provider: CalendarProviderType;
  readonly providerAccountId: string;
  readonly accessTokenEncrypted: string;
  readonly refreshTokenEncrypted: string;
  readonly tokenExpiresAt: ISODateTimeString;
  readonly syncStatus: SyncStatus;
  readonly lastSyncedAt: ISODateTimeString | null;
  readonly lastError: string | null;
}

/** Public view of calendar provider — excludes encrypted tokens. */
export type CalendarProviderPublic = Omit<
  CalendarProvider,
  "accessTokenEncrypted" | "refreshTokenEncrypted"
>;

/** Local cache of a calendar event from an external provider. */
export interface CalendarEvent {
  readonly id: UUID;
  readonly providerId: UUID;
  readonly userId: UUID;
  readonly externalEventId: string;
  readonly title: string | null;
  readonly startsAt: ISODateTimeString;
  readonly endsAt: ISODateTimeString;
  readonly isAllDay: boolean;
  readonly isBusy: boolean;
  readonly syncedAt: ISODateTimeString;
}

/** Focus block created by the system for a task work session. */
export interface FocusBlock extends BaseEntity {
  readonly userId: UUID;
  readonly taskId: UUID;
  readonly startsAt: ISODateTimeString;
  readonly endsAt: ISODateTimeString;
  readonly durationMinutes: number;
  readonly status: FocusBlockStatus;
  readonly externalEventId: string | null;
  readonly bookedAutonomously: boolean;
}

/** Available time window for scheduling. */
export interface AvailabilityWindow {
  readonly startsAt: ISODateTimeString;
  readonly endsAt: ISODateTimeString;
  readonly durationMinutes: number;
}

/** Input for requesting a focus block. */
export interface CreateFocusBlockInput {
  readonly taskId: UUID;
  readonly preferredDuration: number;
  readonly latestStartBy: ISODateTimeString;
  readonly allowAutonomousBooking: boolean;
}

/** Input for connecting a calendar provider. */
export interface ConnectProviderInput {
  readonly provider: CalendarProviderType;
}

/** Response from provider connect — returns OAuth authorization URL. */
export interface ConnectProviderResponse {
  readonly authorizationUrl: string;
}
