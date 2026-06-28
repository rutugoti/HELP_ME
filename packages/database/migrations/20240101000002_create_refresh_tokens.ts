/**
 * Migration: Create refresh_tokens table
 *
 * Each row represents one active session. Logout invalidates the row.
 * Password reset invalidates all rows for the user.
 * Tokens are stored as SHA-256 hashes — raw tokens never persisted.
 *
 * Forward-only migration per Rule 6.
 */

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("refresh_tokens", (table) => {
    table.uuid("id").primary().notNullable();
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.string("token_hash", 255).unique().notNullable();
    table.timestamp("expires_at", { useTz: true }).notNullable();
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("revoked_at", { useTz: true }).nullable();
    table.string("ip_address", 45).nullable();
    table.text("user_agent").nullable();

    // Indexes per Db.md
    table.index("user_id", "idx_refresh_tokens_user_id");
    table.index("expires_at", "idx_refresh_tokens_expires_at");
  });
}

export async function down(_knex: Knex): Promise<void> {
  throw new Error("Down migrations are not supported. Write a corrective migration instead. (Rule 6)");
}


