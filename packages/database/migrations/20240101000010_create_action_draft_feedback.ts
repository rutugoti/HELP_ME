/**
 * Migration: Create action_draft_feedback table
 *
 * Stores user feedback on action drafts. One row per feedback event.
 * Used to improve future Action Engine outputs for the user.
 *
 * Forward-only migration per Rule 6.
 */

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE feedback_type AS ENUM (
      'used-as-is', 'modified-and-used', 'discarded',
      'too-generic', 'inaccurate'
    )
  `);

  await knex.schema.createTable("action_draft_feedback", (table) => {
    table.uuid("id").primary().notNullable();
    table.uuid("draft_id").notNullable().references("id").inTable("action_drafts").onDelete("CASCADE");
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.specificType("feedback_type", "feedback_type").notNullable();
    table.text("notes").nullable();
    table.timestamp("submitted_at", { useTz: true }).notNullable();

    // Indexes per Db.md
    table.index("draft_id", "idx_draft_feedback_draft_id");
    table.index("user_id", "idx_draft_feedback_user_id");
    table.index("submitted_at", "idx_draft_feedback_submitted_at");
  });
}

export async function down(_knex: Knex): Promise<void> {
  throw new Error("Down migrations are not supported. Write a corrective migration instead. (Rule 6)");
}


