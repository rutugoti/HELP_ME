/**
 * Migration: Create tasks table
 *
 * Core task storage. Every task created by any user lives here.
 * effective_deadline is set by the Context Engine when behavioral
 * adjustment is applied — null means no adjustment made.
 * Composite index on (user_id, status, deadline) is the primary
 * query pattern for task list endpoints.
 *
 * Forward-only migration per Rule 6.
 */

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE task_status AS ENUM (
      'open', 'in-progress', 'completed', 'overdue', 'cancelled'
    )
  `);

  await knex.raw(`
    CREATE TYPE consequence_severity AS ENUM (
      'critical', 'high', 'medium', 'low'
    )
  `);

  await knex.schema.createTable("tasks", (table) => {
    table.uuid("id").primary().notNullable();
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.string("title", 500).notNullable();
    table.text("description").nullable();
    table.string("category", 100).notNullable();
    table.specificType("status", "task_status").notNullable().defaultTo("open");
    table.timestamp("deadline", { useTz: true }).notNullable();
    table.timestamp("effective_deadline", { useTz: true }).nullable();
    table.integer("estimated_minutes").nullable();
    table.integer("actual_minutes").nullable();
    table.specificType("consequence_severity", "consequence_severity").notNullable();
    table.timestamp("initiated_at", { useTz: true }).nullable();
    table.timestamp("completed_at", { useTz: true }).nullable();
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("deleted_at", { useTz: true }).nullable();

    // Indexes per Db.md
    table.index("user_id", "idx_tasks_user_id");
    table.index("status", "idx_tasks_status");
    table.index("deadline", "idx_tasks_deadline");
    table.index("category", "idx_tasks_category");
    table.index(["user_id", "status", "deadline"], "idx_tasks_user_status_deadline");
  });

  // Partial index for soft delete filtering
  await knex.raw(`
    CREATE INDEX idx_tasks_not_deleted ON tasks (id) WHERE deleted_at IS NULL
  `);
}

export async function down(_knex: Knex): Promise<void> {
  throw new Error("Down migrations are not supported. Write a corrective migration instead. (Rule 6)");
}


