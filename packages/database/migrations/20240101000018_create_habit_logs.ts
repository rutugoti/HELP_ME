/**
 * Migration: Create habit_logs table
 *
 * Daily log entries for habit tracking. One row per user per
 * habit per day, enforced by unique constraint.
 * effort_rating is user-reported score 1–5.
 *
 * Forward-only migration per Rule 6.
 */

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("habit_logs", (table) => {
    table.uuid("id").primary().notNullable();
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.string("habit_category", 100).notNullable();
    table.date("log_date").notNullable();
    table.boolean("is_completed").notNullable().defaultTo(false);
    table.smallint("effort_rating").nullable();
    table.text("notes").nullable();
    table.timestamp("logged_at", { useTz: true }).notNullable();

    // Unique constraint — one entry per user per habit per day
    table.unique(["user_id", "habit_category", "log_date"], {
      indexName: "uq_habit_logs_user_category_date",
    });

    // Indexes per Db.md
    table.index(["user_id", "habit_category"], "idx_habit_logs_user_category");
    table.index("log_date", "idx_habit_logs_date");
  });

  // Check constraint for effort_rating 1-5
  await knex.raw(`
    ALTER TABLE habit_logs
    ADD CONSTRAINT chk_effort_rating_range
    CHECK (effort_rating IS NULL OR (effort_rating >= 1 AND effort_rating <= 5))
  `);
}

export async function down(_knex: Knex): Promise<void> {
  throw new Error(
    "Down migrations are not supported. Write a corrective migration instead. (Rule 6)"
  );
}
