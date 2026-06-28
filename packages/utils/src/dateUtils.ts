// ─────────────────────────────────────────────────────────────
// LastMinute — Date Utilities
// Pure functions for date arithmetic used by both mobile and
// backend services. No platform dependencies.
// ─────────────────────────────────────────────────────────────

/**
 * Returns the number of milliseconds between now and the given deadline.
 * Negative values mean the deadline has passed.
 */
export function msUntilDeadline(deadline: string, now: Date = new Date()): number {
  return new Date(deadline).getTime() - now.getTime();
}

/**
 * Returns the number of hours between now and the given deadline.
 * Negative values mean the deadline has passed.
 */
export function hoursUntilDeadline(deadline: string, now: Date = new Date()): number {
  return msUntilDeadline(deadline, now) / (1000 * 60 * 60);
}

/**
 * Returns the number of full days between now and the given deadline.
 * Negative values mean the deadline has passed.
 */
export function daysUntilDeadline(deadline: string, now: Date = new Date()): number {
  return Math.floor(hoursUntilDeadline(deadline, now) / 24);
}

/**
 * Returns true if the deadline has already passed relative to `now`.
 */
export function isOverdue(deadline: string, now: Date = new Date()): boolean {
  return msUntilDeadline(deadline, now) < 0;
}

/**
 * Returns the ratio of time remaining to estimated effort.
 * Values below 1.0 mean there is not enough time remaining.
 * Used as input to the Priority Engine's deadline proximity score.
 */
export function deadlineToEffortRatio(
  deadline: string,
  estimatedMinutes: number,
  now: Date = new Date()
): number {
  if (estimatedMinutes <= 0) return Infinity;
  const minutesRemaining = msUntilDeadline(deadline, now) / (1000 * 60);
  return minutesRemaining / estimatedMinutes;
}

/**
 * Formats a duration in minutes into a human-readable string.
 * Examples: "45m", "2h 15m", "1d 3h"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 0) return "0m";
  if (minutes < 60) return `${Math.round(minutes)}m`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (remainingHours > 0) return `${days}d ${remainingHours}h`;
  return `${days}d`;
}

/**
 * Formats a deadline into a human-readable relative string.
 * Examples: "in 2 hours", "in 3 days", "5 hours ago"
 */
export function formatDeadlineRelative(deadline: string, now: Date = new Date()): string {
  const hours = hoursUntilDeadline(deadline, now);
  const absHours = Math.abs(hours);

  if (absHours < 1) {
    const minutes = Math.round(Math.abs(hours) * 60);
    const label = minutes === 1 ? "minute" : "minutes";
    return hours >= 0 ? `in ${minutes} ${label}` : `${minutes} ${label} ago`;
  }

  if (absHours < 24) {
    const rounded = Math.round(absHours);
    const label = rounded === 1 ? "hour" : "hours";
    return hours >= 0 ? `in ${rounded} ${label}` : `${rounded} ${label} ago`;
  }

  const days = Math.round(absHours / 24);
  const label = days === 1 ? "day" : "days";
  return hours >= 0 ? `in ${days} ${label}` : `${days} ${label} ago`;
}

/**
 * Checks whether two date ranges overlap.
 * Used by availability and scheduling logic.
 */
export function doRangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  const aS = new Date(aStart).getTime();
  const aE = new Date(aEnd).getTime();
  const bS = new Date(bStart).getTime();
  const bE = new Date(bEnd).getTime();
  return aS < bE && bS < aE;
}

/**
 * Returns an ISO date string (YYYY-MM-DD) for the given date.
 */
export function toISODateString(date: Date): string {
  return date.toISOString().split("T")[0] as string;
}

/**
 * Adds a specified number of days to a date and returns a new Date.
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Adds a specified number of minutes to a date and returns a new Date.
 */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

/**
 * Returns the start of the day (00:00:00.000) for the given date in local time.
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Returns the end of the day (23:59:59.999) for the given date in local time.
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}
