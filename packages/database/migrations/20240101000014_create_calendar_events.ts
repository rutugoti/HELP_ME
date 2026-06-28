/**
 * Migration: Create calendar_events table
 *
 * Local cache of calendar events from external providers.
 * Rebuilt on each sync. Title may be null if user has privacy mode.
 * Composite index on (user_id, starts_at, ends_at) serves the
 * availability window calculation query.
 *
 * Forward-only migration per Rule 6.
 */

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("calendar_events", (table) => {
    table.uuid("id").primary().notNullable();
    table.uuid("provider_id").notNullable().references("id").inTable("calendar_providers").onDelete("CASCADE");
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.string("external_event_id", 500).notNullable();
    table.string("title", 500).nullable();
    table.timestamp("starts_at", { useTz: true }).notNullable();
    table.timestamp("ends_at", { useTz: true }).notNullable();
    table.boolean("is_all_day").notNullable().defaultTo(false);
    table.boolean("is_busy").notNullable().defaultTo(true);
    table.timestamp("synced_at", { useTz: true }).notNullable();

    // Unique constraint per Db.md
    table.unique(["provider_id", "external_event_id"], {
      indexName: "uq_calendar_events_provider_external",
    });

    // Indexes per Db.md
    table.index(["user_id", "starts_at", "ends_at"], "idx_calendar_events_availability");
  });
}

export async function down(_knex: Knex): Promise<void> {
  throw new Error("Down migrations are not supported. Write a corrective migration instead. (Rule 6)");
}


