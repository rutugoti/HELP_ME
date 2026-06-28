// ─────────────────────────────────────────────────────────────
// LastMinute — ActionDraft Knex Repository Implementation
// Maps snake_case database columns to camelCase domain models per Rule 6.
// ─────────────────────────────────────────────────────────────

import { db } from "@lastminute/database";
import type { ActionDraft, SubmitDraftFeedbackInput } from "@lastminute/types";
import { DraftType } from "@lastminute/types";
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

export class ActionDraftRepository implements IActionDraftRepository {
  async createDraft(
    draft: Omit<ActionDraft, "id" | "createdAt" | "updatedAt" | "generatedAt">,
    trx?: Knex.Transaction
  ): Promise<ActionDraft> {
    const query = trx ? trx("action_drafts") : db("action_drafts");
    const id = randomUUID();
    const generatedAt = new Date();

    const [row] = await query
      .insert({
        id,
        task_id: draft.taskId,
        user_id: draft.userId,
        draft_type: draft.draftType,
        content: draft.content,
        is_active: draft.isActive,
        model_version: draft.modelVersion,
        prompt_version: draft.promptVersion,
        generated_at: generatedAt,
      })
      .returning("*");

    if (!row) {
      throw new Error("Failed to insert action draft.");
    }

    return mapRowToActionDraft(row as unknown as Record<string, unknown>);
  }

  async findActiveByTaskId(taskId: string, trx?: Knex.Transaction): Promise<ActionDraft | null> {
    const query = trx ? trx("action_drafts") : db("action_drafts");
    const row = await query.where({ task_id: taskId, is_active: true }).first();
    return row ? mapRowToActionDraft(row as unknown as Record<string, unknown>) : null;
  }

  async submitFeedback(
    draftId: string,
    userId: string,
    input: SubmitDraftFeedbackInput,
    trx?: Knex.Transaction
  ): Promise<void> {
    const query = trx ? trx("action_draft_feedback") : db("action_draft_feedback");
    await query.insert({
      id: randomUUID(),
      draft_id: draftId,
      user_id: userId,
      feedback_type: input.feedbackType,
      notes: input.notes || null,
      submitted_at: new Date(),
    });
  }
}
