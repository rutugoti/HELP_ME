// ─────────────────────────────────────────────────────────────
// LastMinute — Calendar Repositories Interfaces
// Enforces decoupling of data access from business services per Rule 2.
// ─────────────────────────────────────────────────────────────

import type { CalendarProvider, CalendarEvent, FocusBlock } from "@lastminute/types";
import { CalendarProviderType, SyncStatus, FocusBlockStatus } from "@lastminute/types";
import type { Knex } from "knex";

export interface ICalendarProviderRepository {
  findById(id: string, trx?: Knex.Transaction): Promise<CalendarProvider | null>;
  findByUserIdAndProvider(
    userId: string,
    provider: CalendarProviderType,
    trx?: Knex.Transaction
  ): Promise<CalendarProvider | null>;
  listByUserId(userId: string, trx?: Knex.Transaction): Promise<CalendarProvider[]>;
  create(
    provider: Omit<
      CalendarProvider,
      "id" | "createdAt" | "updatedAt" | "lastSyncedAt" | "lastError" | "syncStatus"
    > & { syncStatus?: SyncStatus },
    trx?: Knex.Transaction
  ): Promise<CalendarProvider>;
  updateTokens(
    id: string,
    accessTokenEncrypted: string,
    refreshTokenEncrypted: string,
    expiresAt: string,
    trx?: Knex.Transaction
  ): Promise<void>;
  updateSyncStatus(
    id: string,
    status: SyncStatus,
    lastSyncedAt: string | null,
    lastError: string | null,
    trx?: Knex.Transaction
  ): Promise<void>;
  delete(id: string, trx?: Knex.Transaction): Promise<void>;
}

export interface ICalendarEventRepository {
  findEventsForUserInPeriod(
    userId: string,
    startsAt: Date,
    endsAt: Date,
    trx?: Knex.Transaction
  ): Promise<CalendarEvent[]>;
  rebuildEventsForProvider(
    providerId: string,
    userId: string,
    events: Omit<CalendarEvent, "id" | "providerId" | "userId" | "syncedAt">[],
    trx?: Knex.Transaction
  ): Promise<void>;
}

export interface IFocusBlockRepository {
  findById(id: string, trx?: Knex.Transaction): Promise<FocusBlock | null>;
  create(
    block: Omit<FocusBlock, "id" | "createdAt" | "updatedAt" | "externalEventId" | "status"> & {
      status?: FocusBlockStatus;
      externalEventId?: string | null;
    },
    trx?: Knex.Transaction
  ): Promise<FocusBlock>;
  updateExternalEventId(id: string, externalEventId: string, trx?: Knex.Transaction): Promise<void>;
  updateStatus(id: string, status: FocusBlockStatus, trx?: Knex.Transaction): Promise<void>;
  listForUserInPeriod(
    userId: string,
    startsAt: Date,
    endsAt: Date,
    trx?: Knex.Transaction
  ): Promise<FocusBlock[]>;
}

export interface UserPreferences {
  userId: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays: number[];
  autonomousSchedulingEnabled: boolean;
}

export interface IUserPreferencesRepository {
  findByUserId(userId: string, trx?: Knex.Transaction): Promise<UserPreferences | null>;
}
