/**
 * Migration: Create calendar_providers table
 *
 * OAuth credentials and sync state for each connected calendar
 * provider per user. Access tokens are encrypted with AES-256-GCM
 * per Rule 11 before storage. Unique constraint on (user_id, provider)
 * prevents duplicate provider connections.
 *
 * Forward-only migration per Rule 6.
 */

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE calendar_provider AS ENUM ('google', 'microsoft')
  `);

  await knex.raw(`
    CREATE TYPE sync_status AS ENUM ('active', 'error', 'disconnected')
  `);

  await knex.schema.createTable("calendar_providers", (table) => {
    table.uuid("id").primary().notNullable();
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.specificType("provider", "calendar_provider").notNullable();
    table.string("provider_account_id", 255).notNullable();
    table.text("access_token_encrypted").notNullable();
    table.text("refresh_token_encrypted").notNullable();
    table.timestamp("token_expires_at", { useTz: true }).notNullable();
    table.specificType("sync_status", "sync_status").notNullable().defaultTo("active");
    table.timestamp("last_synced_at", { useTz: true }).nullable();
    table.text("last_error").nullable();
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    // Unique constraint per Db.md
    table.unique(["user_id", "provider"], {
      indexName: "uq_calendar_providers_user_provider",
    });
  });
}

export async function down(_knex: Knex): Promise<void> {
  throw new Error(
    "Down migrations are not supported. Write a corrective migration instead. (Rule 6)"
  );
}
