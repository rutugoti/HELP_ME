// ─────────────────────────────────────────────────────────────
// LastMinute — Common Types
// Shared utility types used across all domain entities.
// ─────────────────────────────────────────────────────────────

/** ISO 8601 date-time string with timezone (TIMESTAMPTZ in PostgreSQL). */
export type ISODateTimeString = string;

/** ISO 8601 date string without time (DATE in PostgreSQL). */
export type ISODateString = string;

/** Time string in HH:MM format (TIME in PostgreSQL). */
export type TimeString = string;

/** UUID v4 string. All primary keys use this format. */
export type UUID = string;

/** Base fields present on every database-backed entity. */
export interface BaseEntity {
  /** UUID v4 primary key, generated at the application layer. */
  readonly id: UUID;
  /** Timestamp when the record was created. */
  readonly createdAt: ISODateTimeString;
  /** Timestamp when the record was last updated. */
  readonly updatedAt: ISODateTimeString;
}

/** Base fields for entities that support soft deletion. */
export interface SoftDeletableEntity extends BaseEntity {
  /** Timestamp when the record was soft-deleted. Null means active. */
  readonly deletedAt: ISODateTimeString | null;
}

/** Cursor-based pagination request parameters. */
export interface PaginationParams {
  /** Maximum number of items to return. */
  readonly limit: number;
  /** Opaque cursor string from a previous response. */
  readonly cursor?: string;
}

/** Cursor-based pagination response metadata. */
export interface PaginationMeta {
  /** Cursor for the next page. Null if no more results. */
  readonly nextCursor: string | null;
  /** Whether more results exist beyond this page. */
  readonly hasMore: boolean;
  /** Total count of matching items, if available. */
  readonly totalCount?: number;
}

/** Standard API response wrapper. */
export interface ApiResponse<T> {
  /** Response status indicator. */
  readonly status: "success" | "error";
  /** Response payload. */
  readonly data: T;
  /** Response metadata including pagination info. */
  readonly meta: PaginationMeta | Record<string, never>;
}

/** Standard API error response. */
export interface ApiError {
  /** HTTP status code. */
  readonly statusCode: number;
  /** Application-specific error code string. */
  readonly code: string;
  /** Human-readable error message. */
  readonly message: string;
  /** Field-level validation error details. */
  readonly details: ApiErrorDetail[];
}

/** Individual field validation error. */
export interface ApiErrorDetail {
  /** Dot-notation path to the field that failed validation. */
  readonly field: string;
  /** Description of the validation failure. */
  readonly message: string;
}
