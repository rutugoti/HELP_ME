// ─────────────────────────────────────────────────────────────
// LastMinute — Crypto & Password Hashing Utilities
// Handles bcrypt password operations and SHA-256 hashing.
// ─────────────────────────────────────────────────────────────

import bcrypt from "bcryptjs";
import crypto from "crypto";

const SALT_ROUNDS = 10;

/**
 * Hashes a plaintext password using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compares a plaintext password with a bcrypt hash.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Computes a SHA-256 hash of a string, represented as hex.
 * Used for storing refresh token hashes in the database.
 */
export function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}
