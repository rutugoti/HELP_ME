// ─────────────────────────────────────────────────────────────
// LastMinute — User Service Repository Interfaces
// Enforces decoupling of data access from business services per Rule 2.
// ─────────────────────────────────────────────────────────────

import type { User, UserPreferences, RefreshToken, UserStats } from "@lastminute/types";
import type { Knex } from "knex";

export interface IUserRepository {
  findById(id: string, trx?: Knex.Transaction): Promise<User | null>;
  findByEmail(email: string, trx?: Knex.Transaction): Promise<User | null>;
  create(
    user: Omit<User, "createdAt" | "updatedAt" | "deletedAt">,
    trx?: Knex.Transaction
  ): Promise<User>;
  update(
    id: string,
    user: Partial<Omit<User, "id" | "createdAt" | "updatedAt" | "deletedAt">>,
    trx?: Knex.Transaction
  ): Promise<User>;
  softDelete(id: string, trx?: Knex.Transaction): Promise<void>;
  updateLastLogin(id: string, trx?: Knex.Transaction): Promise<void>;
  getUserStats(userId: string): Promise<UserStats>;
}

export interface IUserPreferencesRepository {
  findByUserId(userId: string, trx?: Knex.Transaction): Promise<UserPreferences | null>;
  create(
    prefs: Omit<UserPreferences, "createdAt" | "updatedAt">,
    trx?: Knex.Transaction
  ): Promise<UserPreferences>;
  update(
    userId: string,
    prefs: Partial<Omit<UserPreferences, "id" | "userId" | "createdAt" | "updatedAt">>,
    trx?: Knex.Transaction
  ): Promise<UserPreferences>;
}

export interface IRefreshTokenRepository {
  create(
    token: Omit<RefreshToken, "createdAt" | "revokedAt" | "updatedAt">,
    trx?: Knex.Transaction
  ): Promise<void>;
  findByHash(tokenHash: string, trx?: Knex.Transaction): Promise<RefreshToken | null>;
  revoke(id: string, trx?: Knex.Transaction): Promise<void>;
  revokeAllForUser(userId: string, trx?: Knex.Transaction): Promise<void>;
}
