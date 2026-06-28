/**
 * Migration: Create notifications table
 *
 * Every notification issued to any user. Tracks delivery status,
 * read/acted timestamps, and which channels were used.
 * channels_sent is JSONB to record multi-channel delivery.
 *
 * Forward-only migration per Rule 6.
 */

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE notification_urgency AS ENUM ('low', 'medium', 'high', 'critical')
  `);

  await knex.raw(`
    CREATE TYPE notification_status AS ENUM (
      'delivered', 'read', 'dismissed', 'acted-on', 'failed'
    )
  `);

  await knex.schema.createTable("notifications", (table) => {
    table.uuid("id").primary().notNullable();
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.string("type", 100).notNullable();
    table.specificType("urgency", "notification_urgency").notNullable();
    table.string("title", 255).notNullable();
    table.text("body").notNullable();
    table.uuid("related_task_id").nullable();
    table.uuid("related_recommendation_id").nullable();
    table.jsonb("channels_sent").notNullable();
    table.specificType("status", "notification_status").notNullable().defaultTo("delivered");
    table.timestamp("read_at", { useTz: true }).nullable();
    table.timestamp("acted_at", { useTz: true }).nullable();
    table.timestamp("dismissed_at", { useTz: true }).nullable();
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    // Indexes per Db.md
    table.index(["user_id", "status"], "idx_notifications_user_status");
    table.index(["user_id", "created_at"], "idx_notifications_user_created");
    table.index("related_task_id", "idx_notifications_task");
  });
}

export async function down(_knex: Knex): Promise<void> {
  throw new Error("Down migrations are not supported. Write a corrective migration instead. (Rule 6)");
}


