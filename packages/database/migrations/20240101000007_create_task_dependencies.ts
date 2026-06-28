/**
 * Migration: Create task_dependencies table
 *
 * Directed dependency graph between tasks. A row means the
 * dependent_task_id cannot be completed before required_task_id.
 * Unique constraint prevents duplicate edges.
 * Check constraint prevents self-referencing loops.
 *
 * Forward-only migration per Rule 6.
 */

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("task_dependencies", (table) => {
    table.uuid("id").primary().notNullable();
    table.uuid("dependent_task_id").notNullable().references("id").inTable("tasks").onDelete("CASCADE");
    table.uuid("required_task_id").notNullable().references("id").inTable("tasks").onDelete("CASCADE");
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    // Unique constraint to prevent duplicate edges
    table.unique(["dependent_task_id", "required_task_id"], {
      indexName: "uq_task_dependencies_edge",
    });

    // Indexes for bidirectional graph traversal
    table.index("dependent_task_id", "idx_deps_dependent");
    table.index("required_task_id", "idx_deps_required");
  });

  // Check constraint to prevent self-referencing
  await knex.raw(`
    ALTER TABLE task_dependencies
    ADD CONSTRAINT chk_no_self_dependency
    CHECK (dependent_task_id != required_task_id)
  `);
}

export async function down(_knex: Knex): Promise<void> {
  throw new Error("Down migrations are not supported. Write a corrective migration instead. (Rule 6)");
}


