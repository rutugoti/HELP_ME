/**
 * Migration: Create goal_milestones table
 *
 * Weekly milestones auto-generated for each goal by the system,
 * editable by the user. Tracks completion status individually.
 *
 * Forward-only migration per Rule 6.
 */

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("goal_milestones", (table) => {
    table.uuid("id").primary().notNullable();
    table.uuid("goal_id").notNullable().references("id").inTable("goals").onDelete("CASCADE");
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.string("title", 500).notNullable();
    table.date("due_date").notNullable();
    table.boolean("is_completed").notNullable().defaultTo(false);
    table.timestamp("completed_at", { useTz: true }).nullable();
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    // Indexes per Db.md
    table.index("goal_id", "idx_milestones_goal_id");
    table.index("user_id", "idx_milestones_user_id");
  });
}

export async function down(_knex: Knex): Promise<void> {
  throw new Error("Down migrations are not supported. Write a corrective migration instead. (Rule 6)");
}


