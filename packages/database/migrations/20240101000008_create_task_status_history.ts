/**
 * Migration: Create task_status_history table
 *
 * Append-only audit log of every status transition.
 * from_status is null for the first row (creation event).
 * initiated_by distinguishes user actions from system transitions
 * such as automatic overdue detection.
 *
 * Forward-only migration per Rule 6.
 */

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE status_transition_initiator AS ENUM ('user', 'system')
  `);

  await knex.schema.createTable("task_status_history", (table) => {
    table.uuid("id").primary().notNullable();
    table.uuid("task_id").notNullable().references("id").inTable("tasks").onDelete("CASCADE");
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.specificType("from_status", "task_status").nullable();
    table.specificType("to_status", "task_status").notNullable();
    table.timestamp("transitioned_at", { useTz: true }).notNullable();
    table.specificType("initiated_by", "status_transition_initiator").notNullable();

    // Indexes per Db.md
    table.index("task_id", "idx_status_history_task_id");
    table.index("user_id", "idx_status_history_user_id");
    table.index("transitioned_at", "idx_status_history_transitioned_at");
  });
}

export async function down(_knex: Knex): Promise<void> {
  throw new Error(
    "Down migrations are not supported. Write a corrective migration instead. (Rule 6)"
  );
}
