/**
 * Migration: Create task_priority_scores table
 *
 * Most recent computed priority score per task. Updated by the
 * Priority Engine after every scoring run. Stored separately from
 * tasks to allow fast score updates without touching the main record.
 *
 * Forward-only migration per Rule 6.
 */

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE priority_tier AS ENUM (
      'critical', 'high', 'medium', 'low'
    )
  `);

  await knex.schema.createTable("task_priority_scores", (table) => {
    table.uuid("id").primary().notNullable();
    table
      .uuid("task_id")
      .unique()
      .notNullable()
      .references("id")
      .inTable("tasks")
      .onDelete("CASCADE");
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.decimal("total_score", 10, 4).notNullable();
    table.decimal("deadline_proximity_score", 10, 4).notNullable();
    table.decimal("dependency_impact_score", 10, 4).notNullable();
    table.decimal("consequence_severity_score", 10, 4).notNullable();
    table.specificType("priority_tier", "priority_tier").notNullable();
    table.string("scoring_version", 20).notNullable();
    table.timestamp("scored_at", { useTz: true }).notNullable();
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    // Indexes per Db.md
    table.index(["user_id", "priority_tier"], "idx_scores_user_tier");
    table.index("scored_at", "idx_scores_scored_at");
  });
}

export async function down(_knex: Knex): Promise<void> {
  throw new Error(
    "Down migrations are not supported. Write a corrective migration instead. (Rule 6)"
  );
}
