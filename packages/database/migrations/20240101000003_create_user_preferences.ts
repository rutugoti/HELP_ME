/**
 * Migration: Create user_preferences table
 *
 * One row per user. Wide row design (not key-value) to allow typed
 * constraints and indexed access to specific fields.
 * Notification channels stored as JSONB arrays per urgency level.
 *
 * Forward-only migration per Rule 6.
 */

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE escalation_threshold AS ENUM (
      'critical-only', 'high-and-above'
    )
  `);

  await knex.schema.createTable("user_preferences", (table) => {
    table.uuid("id").primary().notNullable();
    table.uuid("user_id").unique().notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.jsonb("notification_low_channels").notNullable();
    table.jsonb("notification_medium_channels").notNullable();
    table.jsonb("notification_high_channels").notNullable();
    table.jsonb("notification_critical_channels").notNullable();
    table.time("working_hours_start").notNullable().defaultTo("09:00");
    table.time("working_hours_end").notNullable().defaultTo("18:00");
    table.jsonb("working_days").notNullable();
    table.boolean("voice_enabled").notNullable().defaultTo(false);
    table.boolean("autonomous_scheduling_enabled").notNullable().defaultTo(false);
    table.boolean("content_privacy_mode").notNullable().defaultTo(false);
    table.string("escalation_contact_email", 255).nullable();
    table.string("escalation_contact_name", 255).nullable();
    table.specificType("escalation_threshold", "escalation_threshold").nullable();
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(_knex: Knex): Promise<void> {
  throw new Error("Down migrations are not supported. Write a corrective migration instead. (Rule 6)");
}


