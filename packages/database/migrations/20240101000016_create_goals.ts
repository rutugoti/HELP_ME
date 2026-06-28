/**
 * Migration: Create goals table
 *
 * User-defined long-horizon goals. Supports soft deletion.
 * The system auto-generates weekly milestones in the
 * goal_milestones table when a goal is created.
 *
 * Forward-only migration per Rule 6.
 */

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE goal_status AS ENUM ('active', 'completed', 'abandoned')
  `);

  await knex.schema.createTable("goals", (table) => {
    table.uuid("id").primary().notNullable();
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.string("title", 500).notNullable();
    table.text("description").nullable();
    table.date("target_date").notNullable();
    table.specificType("status", "goal_status").notNullable().defaultTo("active");
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("deleted_at", { useTz: true }).nullable();

    // Indexes
    table.index("user_id", "idx_goals_user_id");
  });
}

export async function down(_knex: Knex): Promise<void> {
  throw new Error(
    "Down migrations are not supported. Write a corrective migration instead. (Rule 6)"
  );
}
