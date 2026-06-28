// ─────────────────────────────────────────────────────────────
// LastMinute — AI API Functions
// /api/v1/ai/* endpoints
// ─────────────────────────────────────────────────────────────

import type { KyInstance } from "ky";
import type {
  AIRecommendation,
  ApiResponse,
  BehavioralInsights,
  SimulationResult,
  UUID,
} from "@lastminute/types";
import type { SimulateTaskInput } from "@lastminute/schemas";

/** Triggers immediate full re-prioritization. Returns job ID. */
export async function triggerPrioritize(
  client: KyInstance
): Promise<ApiResponse<{ jobId: string }>> {
  return client.post("api/v1/ai/prioritize").json();
}

/** Returns current AI recommendations for the user. */
export async function getRecommendations(
  client: KyInstance
): Promise<ApiResponse<AIRecommendation[]>> {
  return client.get("api/v1/ai/recommendations").json();
}

/** Dismisses a recommendation. */
export async function dismissRecommendation(
  client: KyInstance,
  recommendationId: UUID
): Promise<void> {
  await client.post(`api/v1/ai/recommendations/${recommendationId}/dismiss`);
}

/** Returns behavioral insights from the Context Engine. */
export async function getInsights(client: KyInstance): Promise<ApiResponse<BehavioralInsights>> {
  return client.get("api/v1/ai/insights").json();
}

/** Simulates a hypothetical task — returns predicted score and risk. */
export async function simulateTask(
  client: KyInstance,
  input: SimulateTaskInput
): Promise<ApiResponse<SimulationResult>> {
  return client.post("api/v1/ai/simulate", { json: input }).json();
}
