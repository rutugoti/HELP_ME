// ─────────────────────────────────────────────────────────────
// LastMinute — HTTP Exception Classes
// Enforces standard error payloads across backend services per Rule 2.
// ─────────────────────────────────────────────────────────────

export abstract class HttpError extends Error {
  abstract readonly statusCode: number;
  abstract readonly errorCode: string;
  readonly details?: Record<string, unknown> | unknown[];

  constructor(message: string, details?: Record<string, unknown> | unknown[]) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends HttpError {
  readonly statusCode = 400;
  readonly errorCode = "BAD_REQUEST";
}

export class UnauthorizedError extends HttpError {
  readonly statusCode = 401;
  readonly errorCode = "UNAUTHORIZED";
  constructor(message = "Unauthorized access token.") {
    super(message);
  }
}

export class ForbiddenError extends HttpError {
  readonly statusCode = 403;
  readonly errorCode = "FORBIDDEN";
  constructor(message = "Action forbidden for this account.") {
    super(message);
  }
}

export class NotFoundError extends HttpError {
  readonly statusCode = 404;
  readonly errorCode = "NOT_FOUND";
}

export class ConflictError extends HttpError {
  readonly statusCode = 409;
  readonly errorCode = "CONFLICT";
}

export class ValidationError extends HttpError {
  readonly statusCode = 422;
  readonly errorCode = "VALIDATION_FAILED";
  constructor(message: string, details: { field: string; message: string }[]) {
    super(message, details);
  }
}

export class InternalServerError extends HttpError {
  readonly statusCode = 500;
  readonly errorCode = "INTERNAL_SERVER_ERROR";
}
