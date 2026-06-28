// ─────────────────────────────────────────────────────────────
// LastMinute — Color Utilities
// Category-to-color mapping and priority tier color mapping.
// Platform-independent — returns hex strings consumed by
// both React Native StyleSheet and CSS.
// ─────────────────────────────────────────────────────────────

import { PriorityTier, ConsequenceSeverity, TaskStatus } from "@lastminute/types";

/** Color palette for priority tiers. */
const PRIORITY_COLORS: Record<PriorityTier, string> = {
  [PriorityTier.Critical]: "#EF4444",
  [PriorityTier.High]: "#F59E0B",
  [PriorityTier.Medium]: "#3B82F6",
  [PriorityTier.Low]: "#6B7280",
};

/** Background tints (lower opacity) for priority tiers. */
const PRIORITY_BG_COLORS: Record<PriorityTier, string> = {
  [PriorityTier.Critical]: "#FEE2E2",
  [PriorityTier.High]: "#FEF3C7",
  [PriorityTier.Medium]: "#DBEAFE",
  [PriorityTier.Low]: "#F3F4F6",
};

/** Color palette for task statuses. */
const STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.Open]: "#6B7280",
  [TaskStatus.InProgress]: "#3B82F6",
  [TaskStatus.Completed]: "#10B981",
  [TaskStatus.Overdue]: "#EF4444",
  [TaskStatus.Cancelled]: "#9CA3AF",
};

/** Color palette for consequence severity. */
const SEVERITY_COLORS: Record<ConsequenceSeverity, string> = {
  [ConsequenceSeverity.Critical]: "#EF4444",
  [ConsequenceSeverity.High]: "#F59E0B",
  [ConsequenceSeverity.Medium]: "#3B82F6",
  [ConsequenceSeverity.Low]: "#6B7280",
};

/** Stable hash-based color assignment for task categories. */
const CATEGORY_COLORS = [
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#F97316", // orange
  "#14B8A6", // teal
  "#6366F1", // indigo
  "#84CC16", // lime
  "#E11D48", // rose
  "#0EA5E9", // sky
  "#A855F7", // purple
] as const;

/**
 * Returns the foreground color hex for a priority tier.
 */
export function priorityTierColor(tier: PriorityTier): string {
  return PRIORITY_COLORS[tier];
}

/**
 * Returns the background tint color hex for a priority tier.
 */
export function priorityTierBgColor(tier: PriorityTier): string {
  return PRIORITY_BG_COLORS[tier];
}

/**
 * Returns the color hex for a task status.
 */
export function taskStatusColor(status: TaskStatus): string {
  return STATUS_COLORS[status];
}

/**
 * Returns the color hex for a consequence severity level.
 */
export function consequenceSeverityColor(severity: ConsequenceSeverity): string {
  return SEVERITY_COLORS[severity];
}

/**
 * Returns a deterministic color hex for a task category.
 * Uses a simple string hash to assign a consistent color from the palette.
 */
export function categoryColor(category: string): string {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = ((hash << 5) - hash + category.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % CATEGORY_COLORS.length;
  return CATEGORY_COLORS[index] as string;
}
