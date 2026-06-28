/**
 * Migration: Create focus_blocks table
 *
 * Focus blocks created by the system for task work sessions.
 * Can be booked autonomously if the user has granted permission.
 * external_event_id is populated when the block is written to
 * an external calendar.
 *
 * Forward-only migration per Rule 6.
 */

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE focus_block_status AS ENUM (
      'pending', 'confirmed', 'booked', 'cancelled'
    )
  `);

  await knex.schema.createTable("focus_blocks", (table) => {
    table.uuid("id").primary().notNullable();
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.uuid("task_id").notNullable().references("id").inTable("tasks").onDelete("CASCADE");
    table.timestamp("starts_at", { useTz: true }).notNullable();
    table.timestamp("ends_at", { useTz: true }).notNullable();
    table.integer("duration_minutes").notNullable();
    table.specificType("status", "focus_block_status").notNullable().defaultTo("pending");
    table.string("external_event_id", 500).nullable();
    table.boolean("booked_autonomously").notNullable().defaultTo(false);
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    // Indexes
    table.index("user_id", "idx_focus_blocks_user_id");
    table.index("task_id", "idx_focus_blocks_task_id");
  });
}

export async function down(_knex: Knex): Promise<void> {
  throw new Error("Down migrations are not supported. Write a corrective migration instead. (Rule 6)");
}


