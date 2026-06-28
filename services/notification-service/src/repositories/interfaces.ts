// ─────────────────────────────────────────────────────────────
// LastMinute — Notification Repository Interfaces
// Enforces decoupling of data access from business services per Rule 2.
// ─────────────────────────────────────────────────────────────

import type { Notification, UpdateNotificationPreferencesInput } from "@lastminute/types";

export interface INotificationRepository {
  listForUser(userId: string): Promise<Notification[]>;
  findById(id: string, userId: string): Promise<Notification | null>;
  create(notification: Omit<Notification, "id" | "createdAt" | "updatedAt">): Promise<Notification>;
  markRead(id: string, userId: string): Promise<void>;
  markActed(id: string, userId: string): Promise<void>;
  dismiss(id: string, userId: string): Promise<void>;
}

export interface INotificationPreferencesRepository {
  getPreferences(userId: string): Promise<UpdateNotificationPreferencesInput | null>;
  updatePreferences(userId: string, prefs: UpdateNotificationPreferencesInput): Promise<void>;
}
