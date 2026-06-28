// ─────────────────────────────────────────────────────────────
// LastMinute — Secure & Async Storage Service
// Wraps expo-secure-store for credentials and AsyncStorage
// for non-sensitive local data (offline queue, preferences).
// ─────────────────────────────────────────────────────────────

import * as SecureStore from "expo-secure-store";

// ── Secure Storage (credentials, tokens) ──────────────────

/** Stores a value in the secure keychain. */
export async function setSecure(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

/** Retrieves a value from the secure keychain. Returns null if missing. */
export async function getSecure(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

/** Removes a value from the secure keychain. */
export async function removeSecure(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}

// ── JSON-aware convenience helpers ────────────────────────

/**
 * Stores a JSON-serialisable value in secure storage.
 * Use for small structured data (auth tokens, user IDs).
 */
export async function setSecureJSON<T>(key: string, value: T): Promise<void> {
  await setSecure(key, JSON.stringify(value));
}

/**
 * Retrieves and parses a JSON value from secure storage.
 * Returns null if key does not exist or parse fails.
 */
export async function getSecureJSON<T>(key: string): Promise<T | null> {
  const raw = await getSecure(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// ── In-Memory Cache (non-sensitive, ephemeral) ────────────

const memoryCache = new Map<string, string>();

/** Stores a value in a simple in-memory cache. Lost on app restart. */
export function setMemory(key: string, value: string): void {
  memoryCache.set(key, value);
}

/** Retrieves a value from the in-memory cache. */
export function getMemory(key: string): string | null {
  return memoryCache.get(key) ?? null;
}

/** Removes a value from the in-memory cache. */
export function removeMemory(key: string): void {
  memoryCache.delete(key);
}

/** Clears the entire in-memory cache. */
export function clearMemory(): void {
  memoryCache.clear();
}
