// ─────────────────────────────────────────────────────────────
// LastMinute — Task Category Constants
// Display labels, icons, and colors for task categories.
// ─────────────────────────────────────────────────────────────

import { colors } from "./colors";

export interface CategoryMeta {
  readonly label: string;
  readonly icon: string;
  readonly color: string;
  readonly bgColor: string;
}

/**
 * Category metadata lookup. Keys are the category slug strings
 * stored in the database. Display components import from here
 * rather than hardcoding labels or colors.
 */
export const categories: Record<string, CategoryMeta> = {
  meeting: {
    label: "Meeting",
    icon: "people-outline",
    color: "#8B5CF6",
    bgColor: "#2E1065",
  },
  document: {
    label: "Document",
    icon: "document-text-outline",
    color: "#3B82F6",
    bgColor: "#172554",
  },
  email: {
    label: "Email",
    icon: "mail-outline",
    color: "#06B6D4",
    bgColor: "#083344",
  },
  review: {
    label: "Review",
    icon: "eye-outline",
    color: "#F59E0B",
    bgColor: "#451A03",
  },
  decision: {
    label: "Decision",
    icon: "git-branch-outline",
    color: "#EF4444",
    bgColor: "#450A0A",
  },
  code: {
    label: "Code",
    icon: "code-slash-outline",
    color: "#10B981",
    bgColor: "#022C22",
  },
  research: {
    label: "Research",
    icon: "search-outline",
    color: "#EC4899",
    bgColor: "#500724",
  },
  general: {
    label: "General",
    icon: "ellipsis-horizontal-circle-outline",
    color: colors.text.secondary,
    bgColor: colors.background.tertiary,
  },
} as const;

/** Ordered list of category keys for picker/filter UIs. */
export const categoryKeys = Object.keys(categories);
