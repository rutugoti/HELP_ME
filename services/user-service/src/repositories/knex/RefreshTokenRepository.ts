// ─────────────────────────────────────────────────────────────
// LastMinute — RefreshToken Knex Repository Implementation
// Maps snake_case database columns to camelCase domain models per Rule 6.
// ─────────────────────────────────────────────────────────────

import { db } from "@lastminute/database";
import type { RefreshToken } from "@lastminute/types";
import type { IRefreshTokenRepository } from "../interfaces.js";
import type { Knex } from "knex";

export function mapRowToRefreshToken(row: Record<string, unknown>): RefreshToken {
  const createdAtStr = new Date(row["created_at"] as string).toISOString();
  return {
    id: row["id"] as string,
    userId: row["user_id"] as string,
    tokenHash: row["token_hash"] as string,
    expiresAt: new Date(row["expires_at"] as string).toISOString(),
    revokedAt: row["revoked_at"] ? new Date(row["revoked_at"] as string).toISOString() : null,
    ipAddress: (row["ip_address"] as string | undefined) ?? null,
    userAgent: (row["user_agent"] as string | undefined) ?? null,
    createdAt: createdAtStr,
    updatedAt: createdAtStr,
  };
}

export class RefreshTokenRepository implements IRefreshTokenRepository {
  async create(
    token: Omit<RefreshToken, "createdAt" | "revokedAt" | "updatedAt">,
    trx?: Knex.Transaction
  ): Promise<void> {
    const query = trx ? trx("refresh_tokens") : db("refresh_tokens");
    await query.insert({
      id: token.id,
      user_id: token.userId,
      token_hash: token.tokenHash,
      expires_at: new Date(token.expiresAt),
      ip_address: token.ipAddress,
      user_agent: token.userAgent,
    });
  }

  async findByHash(tokenHash: string, trx?: Knex.Transaction): Promise<RefreshToken | null> {
    const query = trx ? trx("refresh_tokens") : db("refresh_tokens");
    const row = await query.where({ token_hash: tokenHash }).whereNull("revoked_at").first();
    return row ? mapRowToRefreshToken(row) : null;
  }

  async revoke(id: string, trx?: Knex.Transaction): Promise<void> {
    const query = trx ? trx("refresh_tokens") : db("refresh_tokens");
    await query.where({ id }).update({
      revoked_at: new Date(),
    });
  }

  async revokeAllForUser(userId: string, trx?: Knex.Transaction): Promise<void> {
    const query = trx ? trx("refresh_tokens") : db("refresh_tokens");
    await query.where({ user_id: userId }).whereNull("revoked_at").update({
      revoked_at: new Date(),
    });
  }
}
