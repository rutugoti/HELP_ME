/**
 * Migration: Create users table
 *
 * Core identity and authentication table for every registered user.
 * The role ENUM determines consequence severity weights and behavioral
 * model baseline in the Context Engine. Role cannot be changed after
 * account creation without contacting support.
 *
 * Forward-only migration per Rule 6 — no down migration.
 */

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Create the user role enum type
  await knex.raw(`
    CREATE TYPE user_role AS ENUM (
      'executive', 'medical', 'legal', 'developer',
      'manager', 'student', 'professional'
    )
  `);

  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary().notNullable();
    table.string("email", 255).unique().notNullable();
    table.string("password_hash", 255).notNullable();
    table.string("full_name", 255).notNullable();
    table.specificType("role", "user_role").notNullable();
    table.string("timezone", 100).notNullable().defaultTo("UTC");
    table.boolean("is_verified").notNullable().defaultTo(false);
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamp("last_login_at", { useTz: true }).nullable();
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("deleted_at", { useTz: true }).nullable();

    // Indexes per Db.md
    table.index("role", "idx_users_role");
    table.index("is_active", "idx_users_is_active");
  });
}

export async function down(_knex: Knex): Promise<void> {
  throw new Error(
    "Down migrations are not supported. Write a corrective migration instead. (Rule 6)"
  );
}
