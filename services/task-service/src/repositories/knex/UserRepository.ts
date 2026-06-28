// ─────────────────────────────────────────────────────────────
// LastMinute — Read-only User Knex Repository for Task Service
// Used to retrieve user role for default consequence severity initialization.
// ─────────────────────────────────────────────────────────────

import { db } from "@lastminute/database";
import type { UserRole } from "@lastminute/types";
import type { Knex } from "knex";

export class UserRepository {
  async findRoleByUserId(userId: string, trx?: Knex.Transaction): Promise<UserRole | null> {
    const query = trx ? trx("users") : db("users");
    const row = await query.select("role").where({ id: userId }).whereNull("deleted_at").first();
    return row ? (row.role as UserRole) : null;
  }
}
