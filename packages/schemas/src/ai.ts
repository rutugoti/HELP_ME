// ─────────────────────────────────────────────────────────────
// LastMinute — AI Schemas
// Validation for: simulate, recommendations, insights
// ─────────────────────────────────────────────────────────────

import { z } from "zod";
import { RecommendationSeverity } from "@lastminute/types";
import { isoDateTimeSchema } from "./common.js";

/** POST /api/v1/ai/simulate */
export const simulateTaskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  deadline: isoDateTimeSchema,
  estimatedMinutes: z.number().int().positive().max(10080).optional(),
  category: z.string().min(1).max(100),
  consequenceSeverity: z.string().optional(),
});

/** AI recommendation response. */
export const aiRecommendationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  recommendationType: z.string(),
  content: z.string(),
  reasoning: z.string(),
  isDismissed: z.boolean(),
  dismissedAt: z.string().nullable(),
  relatedTaskId: z.string().uuid().nullable(),
  severity: z.nativeEnum(RecommendationSeverity),
  generatedAt: z.string(),
  expiresAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** Simulation result response. */
export const simulationResultSchema = z.object({
  predictedScore: z.number(),
  predictedTier: z.string(),
  riskAssessment: z.string(),
  conflictsWithExisting: z.boolean(),
  affectedTaskIds: z.array(z.string().uuid()),
});

/** Category pattern in behavioral insights. */
export const categoryPatternSchema = z.object({
  category: z.string(),
  averageInitiationDelay: z.number(),
  onTimeRate: z.number(),
});

/** Focus window analysis in behavioral insights. */
export const focusWindowAnalysisSchema = z.object({
  hour: z.number().int().min(0).max(23),
  dayOfWeek: z.number().int().min(0).max(6),
  productivityScore: z.number(),
});

/** Category trend in behavioral insights. */
export const categoryTrendSchema = z.object({
  category: z.string(),
  completionRate30d: z.number(),
  completionRate90d: z.number(),
  trend: z.enum(["improving", "declining", "stable"]),
});

/** GET /api/v1/ai/insights — full behavioral insights response. */
export const behavioralInsightsSchema = z.object({
  procrastinationPatterns: z.array(categoryPatternSchema),
  optimalFocusWindows: z.array(focusWindowAnalysisSchema),
  categoryTrends: z.array(categoryTrendSchema),
});

/** Prioritize job response. */
export const prioritizeJobSchema = z.object({
  jobId: z.string(),
});

export type SimulateTaskInput = z.infer<typeof simulateTaskSchema>;
