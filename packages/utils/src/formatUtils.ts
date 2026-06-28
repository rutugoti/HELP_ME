// ─────────────────────────────────────────────────────────────
// LastMinute — Format Utilities
// Pure formatting functions shared across mobile and backend.
// ─────────────────────────────────────────────────────────────

import { TaskStatus, UserRole, DraftType, NotificationUrgency } from "@lastminute/types";

/**
 * Returns a human-readable label for a task status.
 */
export function taskStatusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    [TaskStatus.Open]: "Open",
    [TaskStatus.InProgress]: "In Progress",
    [TaskStatus.Completed]: "Completed",
    [TaskStatus.Overdue]: "Overdue",
    [TaskStatus.Cancelled]: "Cancelled",
  };
  return labels[status];
}

/**
 * Returns a human-readable label for a user role.
 */
export function userRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    [UserRole.Executive]: "Executive",
    [UserRole.Medical]: "Medical Professional",
    [UserRole.Legal]: "Legal Professional",
    [UserRole.Developer]: "Developer",
    [UserRole.Manager]: "Project Manager",
    [UserRole.Student]: "Student",
    [UserRole.Professional]: "Professional",
  };
  return labels[role];
}

/**
 * Returns a human-readable label for a draft type.
 */
export function draftTypeLabel(type: DraftType): string {
  const labels: Record<DraftType, string> = {
    [DraftType.Outline]: "Outline",
    [DraftType.DraftEmail]: "Draft Email",
    [DraftType.DraftDocument]: "Draft Document",
    [DraftType.DecisionBrief]: "Decision Brief",
    [DraftType.Checklist]: "Checklist",
    [DraftType.MeetingAgenda]: "Meeting Agenda",
  };
  return labels[type];
}

/**
 * Returns a human-readable label for notification urgency.
 */
export function urgencyLabel(urgency: NotificationUrgency): string {
  const labels: Record<NotificationUrgency, string> = {
    [NotificationUrgency.Low]: "Low",
    [NotificationUrgency.Medium]: "Medium",
    [NotificationUrgency.High]: "High",
    [NotificationUrgency.Critical]: "Critical",
  };
  return labels[urgency];
}

/**
 * Truncates a string to the specified length and adds ellipsis if truncated.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

/**
 * Returns user initials from a full name.
 * Example: "John Doe" → "JD", "Alice" → "A"
 */
export function getInitials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

/**
 * Pluralizes a word based on count.
 * Example: pluralize(3, "task", "tasks") → "3 tasks"
 */
export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
