// ─────────────────────────────────────────────────────────────
// LastMinute — API Client Core
// Base HTTP client built on ky. The mobile app wraps this with
// SecureStore JWT injection. Backend services don't use this.
// ─────────────────────────────────────────────────────────────

import ky, { type KyInstance, type Options } from "ky";
import type { ApiResponse, ApiError } from "@lastminute/types";

/** Configuration for creating an API client instance. */
export interface ApiClientConfig {
  /** Base URL of the API gateway (e.g., "https://api.lastminute.app"). */
  baseUrl: string;
  /** Function that returns the current JWT access token. */
  getAccessToken: () => Promise<string | null>;
  /** Function called when a 401 is received — triggers token refresh. */
  onUnauthorized?: () => Promise<void>;
  /** Optional request timeout in milliseconds. Default: 30000. */
  timeout?: number;
}

/** Creates a configured ky instance with auth and error handling. */
export function createApiClient(config: ApiClientConfig): KyInstance {
  return ky.create({
    prefixUrl: config.baseUrl,
    timeout: config.timeout ?? 30000,
    hooks: {
      beforeRequest: [
        async (request) => {
          const token = await config.getAccessToken();
          if (token) {
            request.headers.set("Authorization", `Bearer ${token}`);
          }
        },
      ],
      afterResponse: [
        async (_request, _options, response) => {
          if (response.status === 401 && config.onUnauthorized) {
            await config.onUnauthorized();
          }
        },
      ],
    },
    retry: {
      limit: 2,
      methods: ["get"],
      statusCodes: [408, 502, 503, 504],
    },
  });
}

/**
 * Extracts the data payload from a standard API response.
 * Throws a typed ApiError if the response indicates failure.
 */
export async function unwrapResponse<T>(responsePromise: Promise<ApiResponse<T>>): Promise<T> {
  const response = await responsePromise;
  if (response.status === "error") {
    throw response.data as unknown as ApiError;
  }
  return response.data;
}

/**
 * Extracts both data and pagination meta from a list response.
 */
export async function unwrapListResponse<T>(
  responsePromise: Promise<ApiResponse<T[]>>
): Promise<{ data: T[]; nextCursor: string | null; hasMore: boolean }> {
  const response = await responsePromise;
  if (response.status === "error") {
    throw response.data as unknown as ApiError;
  }
  const meta = response.meta as { nextCursor: string | null; hasMore: boolean };
  return {
    data: response.data,
    nextCursor: meta.nextCursor ?? null,
    hasMore: meta.hasMore ?? false,
  };
}

/**
 * Converts a typed query object to a URLSearchParams-compatible record.
 * Filters out undefined values and converts numbers to strings.
 */
export function toSearchParams(
  query: Record<string, string | number | boolean | undefined> | undefined
): Record<string, string> | undefined {
  if (!query) return undefined;
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      params[key] = String(value);
    }
  }
  return params;
}

export type { KyInstance, Options };
