// ─────────────────────────────────────────────────────────────
// LastMinute — CalendarProvider Knex Repository Implementation
// Maps snake_case database columns to camelCase domain models per Rule 6.
// ─────────────────────────────────────────────────────────────

import { db } from "@lastminute/database";
import { CalendarProviderType, SyncStatus } from "@lastminute/types";
import type { CalendarProvider } from "@lastminute/types";
import type { ICalendarProviderRepository } from "../interfaces.js";
import type { Knex } from "knex";
import { randomUUID } from "crypto";

export function mapRowToProvider(row: Record<string, unknown>): CalendarProvider {
  return {
    id: row["id"] as string,
    userId: row["user_id"] as string,
    provider: row["provider"] as CalendarProviderType,
    providerAccountId: row["provider_account_id"] as string,
    accessTokenEncrypted: row["access_token_encrypted"] as string,
    refreshTokenEncrypted: row["refresh_token_encrypted"] as string,
    tokenExpiresAt: new Date(row["token_expires_at"] as string).toISOString(),
    syncStatus: row["sync_status"] as SyncStatus,
    lastSyncedAt: row["last_synced_at"]
      ? new Date(row["last_synced_at"] as string).toISOString()
      : null,
    lastError: (row["last_error"] as string | undefined) ?? null,
    createdAt: new Date(row["created_at"] as string).toISOString(),
    updatedAt: new Date(row["updated_at"] as string).toISOString(),
  };
}

export class CalendarProviderRepository implements ICalendarProviderRepository {
  async findById(id: string, trx?: Knex.Transaction): Promise<CalendarProvider | null> {
    const query = trx ? trx("calendar_providers") : db("calendar_providers");
    const row = await query.where({ id }).first();
    return row ? mapRowToProvider(row as unknown as Record<string, unknown>) : null;
  }

  async findByUserIdAndProvider(
    userId: string,
    provider: CalendarProviderType,
    trx?: Knex.Transaction
  ): Promise<CalendarProvider | null> {
    const query = trx ? trx("calendar_providers") : db("calendar_providers");
    const row = await query.where({ user_id: userId, provider }).first();
    return row ? mapRowToProvider(row as unknown as Record<string, unknown>) : null;
  }

  async listByUserId(userId: string, trx?: Knex.Transaction): Promise<CalendarProvider[]> {
    const query = trx ? trx("calendar_providers") : db("calendar_providers");
    const rows = await query.where({ user_id: userId });
    return rows.map((r) => mapRowToProvider(r as unknown as Record<string, unknown>));
  }

  async create(
    provider: Omit<
      CalendarProvider,
      "id" | "createdAt" | "updatedAt" | "lastSyncedAt" | "lastError" | "syncStatus"
    > & { syncStatus?: SyncStatus },
    trx?: Knex.Transaction
  ): Promise<CalendarProvider> {
    const query = trx ? trx("calendar_providers") : db("calendar_providers");
    const id = randomUUID();

    const [row] = await query
      .insert({
        id,
        user_id: provider.userId,
        provider: provider.provider,
        provider_account_id: provider.providerAccountId,
        access_token_encrypted: provider.accessTokenEncrypted,
        refresh_token_encrypted: provider.refreshTokenEncrypted,
        token_expires_at: new Date(provider.tokenExpiresAt),
        sync_status: provider.syncStatus || SyncStatus.Active,
      })
      .returning("*");

    if (!row) {
      throw new Error("Failed to insert calendar provider.");
    }

    return mapRowToProvider(row as unknown as Record<string, unknown>);
  }

  async updateTokens(
    id: string,
    accessTokenEncrypted: string,
    refreshTokenEncrypted: string,
    expiresAt: string,
    trx?: Knex.Transaction
  ): Promise<void> {
    const query = trx ? trx("calendar_providers") : db("calendar_providers");
    await query.where({ id }).update({
      access_token_encrypted: accessTokenEncrypted,
      refresh_token_encrypted: refreshTokenEncrypted,
      token_expires_at: new Date(expiresAt),
      updated_at: new Date(),
    });
  }

  async updateSyncStatus(
    id: string,
    status: SyncStatus,
    lastSyncedAt: string | null,
    lastError: string | null,
    trx?: Knex.Transaction
  ): Promise<void> {
    const query = trx ? trx("calendar_providers") : db("calendar_providers");
    await query.where({ id }).update({
      sync_status: status,
      last_synced_at: lastSyncedAt ? new Date(lastSyncedAt) : null,
      last_error: lastError,
      updated_at: new Date(),
    });
  }

  async delete(id: string, trx?: Knex.Transaction): Promise<void> {
    const query = trx ? trx("calendar_providers") : db("calendar_providers");
    await query.where({ id }).delete();
  }
}
