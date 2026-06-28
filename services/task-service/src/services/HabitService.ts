// ─────────────────────────────────────────────────────────────
// LastMinute — Habit Service
// Computes habit streak analytics and behavioral drift detection.
// ─────────────────────────────────────────────────────────────

import type { HabitLog, HabitSummary, LogHabitInput } from "@lastminute/types";
import type { IHabitLogRepository } from "../repositories/interfaces.js";
import { logger } from "../config/logger.js";

export class HabitService {
  constructor(private readonly habitRepo: IHabitLogRepository) {}

  /**
   * Logs a daily habit completion or status update.
   */
  async logHabit(userId: string, habitCategory: string, input: LogHabitInput): Promise<HabitLog> {
    const todayStr = new Date().toISOString().split("T")[0]!;

    const log = await this.habitRepo.upsert({
      userId,
      habitCategory,
      logDate: todayStr,
      isCompleted: true,
      effortRating: input.effortRating ?? null,
      notes: input.notes ?? null,
    });

    logger.info("Habit logged successfully", { userId, habitCategory, todayStr });
    return log;
  }

  /**
   * Lists habit summary stats for the user, computing streaks, day rates, and drift.
   */
  async listHabits(userId: string): Promise<HabitSummary[]> {
    const allLogs = await this.habitRepo.listForUser(userId);

    // Group logs by habit category
    const categoryLogsMap = new Map<string, HabitLog[]>();
    for (const log of allLogs) {
      if (!categoryLogsMap.has(log.habitCategory)) {
        categoryLogsMap.set(log.habitCategory, []);
      }
      categoryLogsMap.get(log.habitCategory)!.push(log);
    }

    const summaries: HabitSummary[] = [];

    for (const [category, logs] of categoryLogsMap.entries()) {
      // Sort logs by date ascending for sequential processing
      const sortedLogs = [...logs].sort((a, b) => a.logDate.localeCompare(b.logDate));

      // 1. Calculate streaks (current & longest)
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      const completionMap = new Map<string, boolean>();
      for (const log of sortedLogs) {
        completionMap.set(log.logDate, log.isCompleted);
      }

      // Find unique completion dates
      const dates = Array.from(completionMap.keys()).sort();

      if (dates.length > 0) {
        // Calculate longest streak
        for (let i = 0; i < dates.length; i++) {
          const dateStr = dates[i]!;
          const completed = completionMap.get(dateStr);

          if (completed) {
            tempStreak++;
            if (tempStreak > longestStreak) {
              longestStreak = tempStreak;
            }
          } else {
            tempStreak = 0;
          }
        }

        // Calculate current streak checking back from today
        const today = new Date();
        let checkDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        let consecutive = true;

        while (consecutive) {
          const checkStr = checkDate.toISOString().split("T")[0]!;
          const logVal = completionMap.get(checkStr);

          if (logVal === true) {
            currentStreak++;
            // Go to yesterday
            checkDate.setDate(checkDate.getDate() - 1);
          } else if (logVal === false) {
            // Logged as missed
            consecutive = false;
          } else {
            // Not logged. If it's today and not logged yet, check yesterday to continue streak
            const isToday = checkStr === today.toISOString().split("T")[0]!;
            if (isToday) {
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              // Gap in history ends the current streak
              consecutive = false;
            }
          }
        }
      }

      // 2. Completion rate by day of week (0 = Sunday, 6 = Saturday)
      const dayCounts: Record<number, { completed: number; total: number }> = {};
      for (let d = 0; d < 7; d++) {
        dayCounts[d] = { completed: 0, total: 0 };
      }

      for (const log of sortedLogs) {
        // Parse date in UTC to avoid timezone shift inconsistencies
        const dateParts = log.logDate.split("-");
        const dateObj = new Date(
          Number(dateParts[0]),
          Number(dateParts[1]) - 1,
          Number(dateParts[2])
        );
        const dayOfWeek = dateObj.getDay();

        dayCounts[dayOfWeek]!.total++;
        if (log.isCompleted) {
          dayCounts[dayOfWeek]!.completed++;
        }
      }

      const completionRateByDay: Record<number, number> = {};
      for (let d = 0; d < 7; d++) {
        const counts = dayCounts[d]!;
        completionRateByDay[d] = counts.total > 0 ? counts.completed / counts.total : 0;
      }

      // 3. Behavioral Drift: check last 14 days completion rate vs total baseline
      const totalBaseline = sortedLogs.filter((l) => l.isCompleted).length / sortedLogs.length;

      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      const fourteenDaysAgoStr = fourteenDaysAgo.toISOString().split("T")[0]!;

      const recentLogs = sortedLogs.filter((l) => l.logDate >= fourteenDaysAgoStr);
      let hasBehavioralDrift = false;

      if (recentLogs.length > 0 && sortedLogs.length > 5) {
        const recentRate = recentLogs.filter((l) => l.isCompleted).length / recentLogs.length;
        // Drift detected if recent completion drops by 20% or more compared to baseline
        if (totalBaseline - recentRate >= 0.2) {
          hasBehavioralDrift = true;
        }
      }

      summaries.push({
        habitCategory: category,
        currentStreak,
        longestStreak,
        completionRateByDay,
        hasBehavioralDrift,
      });
    }

    return summaries;
  }
}
