/**
 * Migration: Create task_score_history table
 *
 * Append-only log of all priority scores ever computed for a task.
 * Used for trend visualization and model improvement.
 * Never updated, only inserted.
 *
 * Forward-only migration per Rule 6.
 */

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("task_score_history", (table) => {
    table.uuid("id").primary().notNullable();
    table.uuid("task_id").notNullable().references("id").inTable("tasks").onDelete("CASCADE");
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.decimal("total_score", 10, 4).notNullable();
    table.specificType("priority_tier", "priority_tier").notNullable();
    table.string("trigger_event", 100).notNullable();
    table.timestamp("scored_at", { useTz: true }).notNullable();

    // Indexes per Db.md
    table.index("task_id", "idx_score_history_task_id");
    table.index("user_id", "idx_score_history_user_id");
    table.index("scored_at", "idx_score_history_scored_at");
  });
}

export async function down(_knex: Knex): Promise<void> {
  throw new Error("Down migrations are not supported. Write a corrective migration instead. (Rule 6)");
}


