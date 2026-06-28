// ─────────────────────────────────────────────────────────────
// LastMinute — ActionDraft Knex Repository Implementation
// Maps snake_case database columns to camelCase domain models per Rule 6.
// ─────────────────────────────────────────────────────────────

import { db } from "@lastminute/database";
import { DraftType, FeedbackType } from "@lastminute/types";
import type { ActionDraft, ActionDraftFeedback } from "@lastminute/types";
import type { IActionDraftRepository } from "../interfaces.js";
import type { Knex } from "knex";
import { randomUUID } from "crypto";

export function mapRowToActionDraft(row: Record<string, unknown>): ActionDraft {
  return {
    id: row["id"] as string,
    taskId: row["task_id"] as string,
    userId: row["user_id"] as string,
    draftType: row["draft_type"] as DraftType,
    content: row["content"] as string,
    isActive: Boolean(row["is_active"]),
    modelVersion: row["model_version"] as string,
    promptVersion: row["prompt_version"] as string,
    generatedAt: new Date(row["generated_at"] as string).toISOString(),
    createdAt: new Date(row["created_at"] as string).toISOString(),
    updatedAt: new Date(row["updated_at"] as string).toISOString(),
  };
}

export function mapRowToFeedback(row: Record<string, unknown>): ActionDraftFeedback {
  return {
    id: row["id"] as string,
    draftId: row["draft_id"] as string,
    userId: row["user_id"] as string,
    feedbackType: row["feedback_type"] as FeedbackType,
    notes: (row["notes"] as string | undefined) ?? null,
    submittedAt: new Date(row["submitted_at"] as string).toISOString(),
  };
}

export class ActionDraftRepository implements IActionDraftRepository {
  async findActiveByTaskId(taskId: string, trx?: Knex.Transaction): Promise<ActionDraft | null> {
    const query = trx ? trx("action_drafts") : db("action_drafts");
    const row = await query.where({ task_id: taskId, is_active: true }).first();

    return row ? mapRowToActionDraft(row as unknown as Record<string, unknown>) : null;
  }

  async createFeedback(
    feedback: Omit<ActionDraftFeedback, "id" | "submittedAt">,
    trx?: Knex.Transaction
  ): Promise<ActionDraftFeedback> {
    const query = trx ? trx("action_draft_feedback") : db("action_draft_feedback");
    const id = randomUUID();

    const [row] = await query
      .insert({
        id,
        draft_id: feedback.draftId,
        user_id: feedback.userId,
        feedback_type: feedback.feedbackType,
        notes: feedback.notes || null,
        submitted_at: new Date(),
      })
      .returning("*");

    if (!row) {
      throw new Error("Failed to insert draft feedback.");
    }

    return mapRowToFeedback(row as unknown as Record<string, unknown>);
  }

  async createDraft(
    draft: Omit<ActionDraft, "id" | "createdAt" | "updatedAt" | "isActive" | "generatedAt">,
    trx?: Knex.Transaction
  ): Promise<ActionDraft> {
    const query = trx ? trx("action_drafts") : db("action_drafts");
    const id = randomUUID();

    const [row] = await query
      .insert({
        id,
        task_id: draft.taskId,
        user_id: draft.userId,
        draft_type: draft.draftType,
        content: draft.content,
        is_active: true,
        model_version: draft.modelVersion,
        prompt_version: draft.promptVersion,
        generated_at: new Date(),
      })
      .returning("*");

    if (!row) {
      throw new Error("Failed to insert action draft.");
    }

    return mapRowToActionDraft(row as unknown as Record<string, unknown>);
  }
}
