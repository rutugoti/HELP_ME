/**
 * Migration: Create behavioral_events table
 *
 * Append-only log of all user behavioral events consumed by the
 * Context Engine. Raw input to the behavioral model.
 * days_before_deadline is calculated at event time and is the key
 * input for initiation delay modeling.
 *
 * Forward-only migration per Rule 6.
 */

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("behavioral_events", (table) => {
    table.uuid("id").primary().notNullable();
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.string("event_type", 100).notNullable();
    table.uuid("task_id").nullable();
    table.string("task_category", 100).nullable();
    table.decimal("days_before_deadline", 10, 2).nullable();
    table.jsonb("event_metadata").nullable();
    table.timestamp("occurred_at", { useTz: true }).notNullable();

    // Indexes per Db.md
    table.index(["user_id", "event_type"], "idx_behavioral_user_type");
    table.index(["user_id", "task_category"], "idx_behavioral_user_category");
    table.index("occurred_at", "idx_behavioral_occurred_at");
  });
}

export async function down(_knex: Knex): Promise<void> {
  throw new Error("Down migrations are not supported. Write a corrective migration instead. (Rule 6)");
}


