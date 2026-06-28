// ─────────────────────────────────────────────────────────────
// LastMinute — Priority Utilities
// Pure functions for priority score formatting and classification.
// Used by both mobile components and backend service logic.
// ─────────────────────────────────────────────────────────────

import { PriorityTier, ConsequenceSeverity } from "@lastminute/types";

/** Priority tier thresholds. Scores above the threshold belong to the tier. */
const TIER_THRESHOLDS = {
  critical: 0.85,
  high: 0.65,
  medium: 0.35,
  low: 0,
} as const;

/**
 * Classifies a numeric score (0–1) into a PriorityTier.
 * Used by the Priority Engine and for display logic.
 */
export function scoreToPriorityTier(score: number): PriorityTier {
  if (score >= TIER_THRESHOLDS.critical) return PriorityTier.Critical;
  if (score >= TIER_THRESHOLDS.high) return PriorityTier.High;
  if (score >= TIER_THRESHOLDS.medium) return PriorityTier.Medium;
  return PriorityTier.Low;
}

/**
 * Returns a human-readable label for a priority tier.
 */
export function priorityTierLabel(tier: PriorityTier): string {
  const labels: Record<PriorityTier, string> = {
    [PriorityTier.Critical]: "Critical",
    [PriorityTier.High]: "High",
    [PriorityTier.Medium]: "Medium",
    [PriorityTier.Low]: "Low",
  };
  return labels[tier];
}

/**
 * Returns a human-readable label for consequence severity.
 */
export function consequenceSeverityLabel(severity: ConsequenceSeverity): string {
  const labels: Record<ConsequenceSeverity, string> = {
    [ConsequenceSeverity.Critical]: "Critical Impact",
    [ConsequenceSeverity.High]: "High Impact",
    [ConsequenceSeverity.Medium]: "Medium Impact",
    [ConsequenceSeverity.Low]: "Low Impact",
  };
  return labels[severity];
}

/**
 * Formats a numeric priority score (0–1) as a percentage string.
 * Example: 0.873 → "87%"
 */
export function formatScoreAsPercent(score: number): string {
  return `${Math.round(score * 100)}%`;
}

/**
 * Formats a numeric priority score (0–1) as a fixed-decimal string.
 * Example: 0.8734 → "0.87"
 */
export function formatScore(score: number, decimals: number = 2): string {
  return score.toFixed(decimals);
}

/**
 * Returns a numeric sort weight for priority tier (higher = more urgent).
 * Used for stable sorting when scores are equal.
 */
export function priorityTierSortWeight(tier: PriorityTier): number {
  const weights: Record<PriorityTier, number> = {
    [PriorityTier.Critical]: 4,
    [PriorityTier.High]: 3,
    [PriorityTier.Medium]: 2,
    [PriorityTier.Low]: 1,
  };
  return weights[tier];
}

/**
 * Returns true if the given tier is at or above the "actionable" threshold.
 * Tasks at high or critical tier should have action drafts prepared.
 */
export function isActionablePriority(tier: PriorityTier): boolean {
  return tier === PriorityTier.Critical || tier === PriorityTier.High;
}
