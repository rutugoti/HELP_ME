// ─────────────────────────────────────────────────────────────
// LastMinute — Validation Utilities
// Pure validation helper functions. These complement Zod schemas
// by providing reusable validators for common field patterns.
// ─────────────────────────────────────────────────────────────

/** Validates an email address format. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Validates a UUID v4 format. */
export function isValidUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

/** Validates an ISO 8601 datetime string. */
export function isValidISODateTime(value: string): boolean {
  const date = new Date(value);
  return !isNaN(date.getTime()) && value.includes("T");
}

/** Validates an ISO 8601 date string (YYYY-MM-DD). */
export function isValidISODate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(new Date(value).getTime());
}

/** Validates a time string in HH:MM format. */
export function isValidTimeString(value: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(value)) return false;
  const [hours, minutes] = value.split(":").map(Number) as [number, number];
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

/** Validates that estimated minutes is a reasonable positive number. */
export function isValidEstimatedMinutes(minutes: number): boolean {
  return Number.isInteger(minutes) && minutes > 0 && minutes <= 10080; // max 1 week
}

/** Validates password strength — minimum 8 chars, at least one letter and one number. */
export function isStrongPassword(password: string): boolean {
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);
}

/** Validates that working days array contains valid day numbers (0–6). */
export function isValidWorkingDays(days: number[]): boolean {
  return (
    days.length > 0 &&
    days.length <= 7 &&
    days.every((d) => Number.isInteger(d) && d >= 0 && d <= 6) &&
    new Set(days).size === days.length
  );
}

/** Validates effort rating (1–5). */
export function isValidEffortRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}
