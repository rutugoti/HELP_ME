// ─────────────────────────────────────────────────────────────
// LastMinute — User Domain Types
// Derived from Db.md: users, refresh_tokens, user_preferences
// ─────────────────────────────────────────────────────────────

import type {
  BaseEntity,
  ISODateTimeString,
  SoftDeletableEntity,
  TimeString,
  UUID,
} from "./common.js";
import type { EscalationThreshold, NotificationChannel, UserRole } from "./enums.js";

// ── users table ──────────────────────────────────────────────

/** Core user identity and authentication record. */
export interface User extends SoftDeletableEntity {
  /** User's email address. Unique across the system. */
  readonly email: string;
  /** bcrypt password hash. Never exposed through API responses. */
  readonly passwordHash: string;
  /** User's display name. */
  readonly fullName: string;
  /** User role — determines consequence weights and behavioral baseline. Cannot change after creation. */
  readonly role: UserRole;
  /** IANA timezone identifier (e.g., "America/New_York"). */
  readonly timezone: string;
  /** Whether the user has verified their email address. */
  readonly isVerified: boolean;
  /** Whether the account is active. Inactive accounts cannot authenticate. */
  readonly isActive: boolean;
  /** Timestamp of the most recent successful login. */
  readonly lastLoginAt: ISODateTimeString | null;
}

/** User data safe for API responses — excludes password hash. */
export type UserPublic = Omit<User, "passwordHash" | "deletedAt">;

/** Fields accepted when creating a new user. */
export interface CreateUserInput {
  readonly email: string;
  readonly password: string;
  readonly fullName: string;
  readonly role: UserRole;
  readonly timezone: string;
  readonly organizationId?: string;
}

/** Fields accepted when updating user profile. */
export interface UpdateUserInput {
  readonly fullName?: string;
  readonly timezone?: string;
  readonly voiceEnabled?: boolean;
}

// ── refresh_tokens table ────────────────────────────────────

/** Refresh token record — one per active session. */
export interface RefreshToken extends BaseEntity {
  /** Foreign key to users.id. */
  readonly userId: UUID;
  /** SHA-256 hash of the raw token value. */
  readonly tokenHash: string;
  /** When this token expires. */
  readonly expiresAt: ISODateTimeString;
  /** When this token was revoked. Null means still valid. */
  readonly revokedAt: ISODateTimeString | null;
  /** IP address of the client that created this session. For audit only. */
  readonly ipAddress: string | null;
  /** User-Agent header from the client that created this session. For audit only. */
  readonly userAgent: string | null;
}

// ── user_preferences table ──────────────────────────────────

/** Per-channel notification configuration by urgency level. */
export interface NotificationPreferences {
  readonly lowChannels: NotificationChannel[];
  readonly mediumChannels: NotificationChannel[];
  readonly highChannels: NotificationChannel[];
  readonly criticalChannels: NotificationChannel[];
}

/** User-configurable preferences. One row per user. */
export interface UserPreferences extends BaseEntity {
  /** Foreign key to users.id. */
  readonly userId: UUID;
  /** Notification channels for low urgency. */
  readonly notificationLowChannels: NotificationChannel[];
  /** Notification channels for medium urgency. */
  readonly notificationMediumChannels: NotificationChannel[];
  /** Notification channels for high urgency. */
  readonly notificationHighChannels: NotificationChannel[];
  /** Notification channels for critical urgency. */
  readonly notificationCriticalChannels: NotificationChannel[];
  /** Start of working hours (HH:MM). */
  readonly workingHoursStart: TimeString;
  /** End of working hours (HH:MM). */
  readonly workingHoursEnd: TimeString;
  /** Days of the week the user works (0=Sunday, 6=Saturday). */
  readonly workingDays: number[];
  /** Whether voice input is enabled. */
  readonly voiceEnabled: boolean;
  /** Whether the system can book calendar blocks without user confirmation. */
  readonly autonomousSchedulingEnabled: boolean;
  /** Whether task content is masked before AI processing. */
  readonly contentPrivacyMode: boolean;
  /** Email address for escalation contact. */
  readonly escalationContactEmail: string | null;
  /** Name of escalation contact. */
  readonly escalationContactName: string | null;
  /** At what urgency level escalation is triggered. */
  readonly escalationThreshold: EscalationThreshold | null;
}

/** Fields accepted when replacing user preferences (full replacement). */
export interface UpdatePreferencesInput {
  readonly notificationLowChannels: NotificationChannel[];
  readonly notificationMediumChannels: NotificationChannel[];
  readonly notificationHighChannels: NotificationChannel[];
  readonly notificationCriticalChannels: NotificationChannel[];
  readonly workingHoursStart: TimeString;
  readonly workingHoursEnd: TimeString;
  readonly workingDays: number[];
  readonly voiceEnabled: boolean;
  readonly autonomousSchedulingEnabled: boolean;
  readonly contentPrivacyMode: boolean;
  readonly escalationContactEmail: string | null;
  readonly escalationContactName: string | null;
  readonly escalationThreshold: EscalationThreshold | null;
}

// ── Auth response types ─────────────────────────────────────

/** Response from register and login endpoints. */
export interface AuthTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly userId: UUID;
  readonly onboardingRequired: boolean;
}

/** User stats returned by GET /api/v1/users/me/stats. */
export interface UserStats {
  /** Task completion rate by category over the last 30 days. */
  readonly completionRateByCategory: Record<string, number>;
  /** Average initiation delay (hours) by category. */
  readonly averageInitiationDelayByCategory: Record<string, number>;
  /** Rate at which the user overrides AI priority assignments. */
  readonly overrideRate: number;
  /** Streak data per habit category. */
  readonly streaksByCategory: Record<string, number>;
  /** Rolling 7-day productivity score (0–100). */
  readonly productivityScore: number;
}
