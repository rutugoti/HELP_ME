// ─────────────────────────────────────────────────────────────
// LastMinute — Shared Enums
// All enum values derived from Db.md schema definitions.
// These are string enums to match PostgreSQL ENUM types and
// ensure type safety across the entire monorepo.
// ─────────────────────────────────────────────────────────────

/** User role determines consequence severity weights and behavioral model baseline. */
export enum UserRole {
  Executive = "executive",
  Medical = "medical",
  Legal = "legal",
  Developer = "developer",
  Manager = "manager",
  Student = "student",
  Professional = "professional",
}

/** Task lifecycle status. Transitions are validated — completed cannot return to open without override. */
export enum TaskStatus {
  Open = "open",
  InProgress = "in-progress",
  Completed = "completed",
  Overdue = "overdue",
  Cancelled = "cancelled",
}

/** Consequence severity — initialized from role defaults, overridable per task. */
export enum ConsequenceSeverity {
  Critical = "critical",
  High = "high",
  Medium = "medium",
  Low = "low",
}

/** Priority tier — computed by the Priority Engine from composite scoring. */
export enum PriorityTier {
  Critical = "critical",
  High = "high",
  Medium = "medium",
  Low = "low",
}

/** AI-generated action draft types. */
export enum DraftType {
  Outline = "outline",
  DraftEmail = "draft-email",
  DraftDocument = "draft-document",
  DecisionBrief = "decision-brief",
  Checklist = "checklist",
  MeetingAgenda = "meeting-agenda",
}

/** User feedback on action drafts — used to improve future outputs. */
export enum FeedbackType {
  UsedAsIs = "used-as-is",
  ModifiedAndUsed = "modified-and-used",
  Discarded = "discarded",
  TooGeneric = "too-generic",
  Inaccurate = "inaccurate",
}

/** AI recommendation severity level. */
export enum RecommendationSeverity {
  Informational = "informational",
  Advisory = "advisory",
  Warning = "warning",
}

/** Supported calendar providers. */
export enum CalendarProviderType {
  Google = "google",
  Microsoft = "microsoft",
}

/** Calendar provider sync status. */
export enum SyncStatus {
  Active = "active",
  Error = "error",
  Disconnected = "disconnected",
}

/** Focus block lifecycle status. */
export enum FocusBlockStatus {
  Pending = "pending",
  Confirmed = "confirmed",
  Booked = "booked",
  Cancelled = "cancelled",
}

/** Goal lifecycle status. */
export enum GoalStatus {
  Active = "active",
  Completed = "completed",
  Abandoned = "abandoned",
}

/** Notification urgency — determines delivery channel selection. */
export enum NotificationUrgency {
  Low = "low",
  Medium = "medium",
  High = "high",
  Critical = "critical",
}

/** Notification delivery/interaction status. */
export enum NotificationStatus {
  Delivered = "delivered",
  Read = "read",
  Dismissed = "dismissed",
  ActedOn = "acted-on",
  Failed = "failed",
}

/** Escalation threshold — when escalation contacts are notified. */
export enum EscalationThreshold {
  CriticalOnly = "critical-only",
  HighAndAbove = "high-and-above",
}

/** Who initiated a task status transition. */
export enum StatusTransitionInitiator {
  User = "user",
  System = "system",
}

/** Notification delivery channels. */
export enum NotificationChannel {
  InApp = "in-app",
  Push = "push",
  Email = "email",
  Sms = "sms",
}
