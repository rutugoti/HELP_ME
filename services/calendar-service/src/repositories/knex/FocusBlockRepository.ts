// ─────────────────────────────────────────────────────────────
// LastMinute — FocusBlock Knex Repository Implementation
// Maps snake_case database columns to camelCase domain models per Rule 6.
// ─────────────────────────────────────────────────────────────

import { db } from "@lastminute/database";
import { FocusBlockStatus } from "@lastminute/types";
import type { FocusBlock } from "@lastminute/types";
import type { IFocusBlockRepository } from "../interfaces.js";
import type { Knex } from "knex";
import { randomUUID } from "crypto";

export function mapRowToFocusBlock(row: Record<string, unknown>): FocusBlock {
  return {
    id: row["id"] as string,
    userId: row["user_id"] as string,
    taskId: row["task_id"] as string,
    startsAt: new Date(row["starts_at"] as string).toISOString(),
    endsAt: new Date(row["ends_at"] as string).toISOString(),
    durationMinutes: Number(row["duration_minutes"]),
    status: row["status"] as FocusBlockStatus,
    externalEventId: (row["external_event_id"] as string | undefined) ?? null,
    bookedAutonomously: Boolean(row["booked_autonomously"]),
    createdAt: new Date(row["created_at"] as string).toISOString(),
    updatedAt: new Date(row["updated_at"] as string).toISOString(),
  };
}

export class FocusBlockRepository implements IFocusBlockRepository {
  async findById(id: string, trx?: Knex.Transaction): Promise<FocusBlock | null> {
    const query = trx ? trx("focus_blocks") : db("focus_blocks");
    const row = await query.where({ id }).first();
    return row ? mapRowToFocusBlock(row as unknown as Record<string, unknown>) : null;
  }

  async create(
    block: Omit<FocusBlock, "id" | "createdAt" | "updatedAt" | "externalEventId" | "status"> & {
      status?: FocusBlockStatus;
      externalEventId?: string | null;
    },
    trx?: Knex.Transaction
  ): Promise<FocusBlock> {
    const query = trx ? trx("focus_blocks") : db("focus_blocks");
    const id = randomUUID();

    const [row] = await query
      .insert({
        id,
        user_id: block.userId,
        task_id: block.taskId,
        starts_at: new Date(block.startsAt),
        ends_at: new Date(block.endsAt),
        duration_minutes: block.durationMinutes,
        status: block.status || FocusBlockStatus.Pending,
        external_event_id: block.externalEventId || null,
        booked_autonomously: block.bookedAutonomously,
      })
      .returning("*");

    if (!row) {
      throw new Error("Failed to insert focus block.");
    }

    return mapRowToFocusBlock(row as unknown as Record<string, unknown>);
  }

  async updateExternalEventId(
    id: string,
    externalEventId: string,
    trx?: Knex.Transaction
  ): Promise<void> {
    const query = trx ? trx("focus_blocks") : db("focus_blocks");
    await query.where({ id }).update({
      external_event_id: externalEventId,
      updated_at: new Date(),
    });
  }

  async updateStatus(id: string, status: FocusBlockStatus, trx?: Knex.Transaction): Promise<void> {
    const query = trx ? trx("focus_blocks") : db("focus_blocks");
    await query.where({ id }).update({
      status,
      updated_at: new Date(),
    });
  }

  async listForUserInPeriod(
    userId: string,
    startsAt: Date,
    endsAt: Date,
    trx?: Knex.Transaction
  ): Promise<FocusBlock[]> {
    const query = trx ? trx("focus_blocks") : db("focus_blocks");
    const rows = await query
      .where({ user_id: userId })
      .andWhere("ends_at", ">=", startsAt)
      .andWhere("starts_at", "<=", endsAt)
      .orderBy("starts_at", "asc");

    return rows.map((r) => mapRowToFocusBlock(r as unknown as Record<string, unknown>));
  }
}
