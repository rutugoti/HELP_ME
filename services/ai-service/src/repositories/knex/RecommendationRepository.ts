// ─────────────────────────────────────────────────────────────
// LastMinute — AIRecommendation Knex Repository Implementation
// Maps snake_case database columns to camelCase domain models per Rule 6.
// ─────────────────────────────────────────────────────────────

import { db } from "@lastminute/database";
import type { AIRecommendation } from "@lastminute/types";
import { RecommendationSeverity } from "@lastminute/types";
import type { IRecommendationRepository } from "../interfaces.js";
import type { Knex } from "knex";
import { randomUUID } from "crypto";

export function mapRowToRecommendation(row: Record<string, unknown>): AIRecommendation {
  return {
    id: row["id"] as string,
    userId: row["user_id"] as string,
    recommendationType: row["recommendation_type"] as string,
    content: row["content"] as string,
    reasoning: row["reasoning"] as string,
    isDismissed: Boolean(row["is_dismissed"]),
    dismissedAt: row["dismissed_at"] ? new Date(row["dismissed_at"] as string).toISOString() : null,
    relatedTaskId: (row["related_task_id"] as string | undefined) ?? null,
    severity: row["severity"] as RecommendationSeverity,
    generatedAt: new Date(row["generated_at"] as string).toISOString(),
    expiresAt: row["expires_at"] ? new Date(row["expires_at"] as string).toISOString() : null,
    createdAt: new Date(row["created_at"] as string).toISOString(),
    updatedAt: new Date(row["updated_at"] as string).toISOString(),
  };
}

export class RecommendationRepository implements IRecommendationRepository {
  async listActiveForUser(userId: string, trx?: Knex.Transaction): Promise<AIRecommendation[]> {
    const query = trx ? trx("ai_recommendations") : db("ai_recommendations");
    const rows = await query
      .where({ user_id: userId, is_dismissed: false })
      .andWhere((qb) => {
        qb.whereNull("expires_at").orWhere("expires_at", ">", new Date());
      })
      .orderBy("generated_at", "desc");

    return rows.map((r) => mapRowToRecommendation(r as unknown as Record<string, unknown>));
  }

  async createRecommendation(
    rec: Omit<AIRecommendation, "id" | "createdAt" | "updatedAt" | "generatedAt">,
    trx?: Knex.Transaction
  ): Promise<AIRecommendation> {
    const query = trx ? trx("ai_recommendations") : db("ai_recommendations");
    const id = randomUUID();
    const generatedAt = new Date();

    const [row] = await query
      .insert({
        id,
        user_id: rec.userId,
        recommendation_type: rec.recommendationType,
        content: rec.content,
        reasoning: rec.reasoning,
        is_dismissed: rec.isDismissed || false,
        related_task_id: rec.relatedTaskId || null,
        severity: rec.severity || RecommendationSeverity.Informational,
        generated_at: generatedAt,
        expires_at: rec.expiresAt ? new Date(rec.expiresAt) : null,
      })
      .returning("*");

    if (!row) {
      throw new Error("Failed to insert AI recommendation.");
    }

    return mapRowToRecommendation(row as unknown as Record<string, unknown>);
  }

  async dismiss(id: string, userId: string, trx?: Knex.Transaction): Promise<void> {
    const query = trx ? trx("ai_recommendations") : db("ai_recommendations");
    await query.where({ id, user_id: userId }).update({
      is_dismissed: true,
      dismissed_at: new Date(),
      updated_at: new Date(),
    });
  }
}
