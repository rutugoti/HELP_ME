/**
 * Migration: Create action_drafts table
 *
 * Stores AI-generated action drafts for tasks. One active draft
 * per task at a time, but history is retained. model_version and
 * prompt_version are recorded per Rule 7 for AI layer tracking.
 *
 * Forward-only migration per Rule 6.
 */

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE draft_type AS ENUM (
      'outline', 'draft-email', 'draft-document',
      'decision-brief', 'checklist', 'meeting-agenda'
    )
  `);

  await knex.schema.createTable("action_drafts", (table) => {
    table.uuid("id").primary().notNullable();
    table.uuid("task_id").notNullable().references("id").inTable("tasks").onDelete("CASCADE");
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.specificType("draft_type", "draft_type").notNullable();
    table.text("content").notNullable();
    table.boolean("is_active").notNullable().defaultTo(true);
    table.string("model_version", 50).notNullable();
    table.string("prompt_version", 20).notNullable();
    table.timestamp("generated_at", { useTz: true }).notNullable();
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    // Indexes per Db.md
    table.index("task_id", "idx_action_drafts_task_id");
    table.index(["task_id", "is_active"], "idx_action_drafts_task_active");
  });
}

export async function down(_knex: Knex): Promise<void> {
  throw new Error(
    "Down migrations are not supported. Write a corrective migration instead. (Rule 6)"
  );
}
