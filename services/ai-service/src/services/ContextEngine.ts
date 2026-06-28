// ─────────────────────────────────────────────────────────────
// LastMinute — Context Engine Service
// Analyzes user behavioral events to calculate procrastinations and shifts.
// ─────────────────────────────────────────────────────────────

import { db } from "@lastminute/database";
import { logger } from "../config/logger.js";
import { randomUUID } from "crypto";

export interface BehavioralModel {
  userId: string;
  role: string;
  lastUpdatedAt: string;
  dominantProcrastinationCategories: string[];
  averageInitiationDelayByCategory: Record<string, number>;
  peakProductivityHours: number[];
  contextModelVersion: string;
}

export class ContextEngine {
  /**
   * Records a raw behavioral event to the append-only logs and logs trace.
   */
  async recordEvent(
    userId: string,
    eventType: string,
    taskId: string | null,
    category: string | null,
    daysBeforeDeadline: number | null,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await db("behavioral_events").insert({
      id: randomUUID(),
      user_id: userId,
      event_type: eventType,
      task_id: taskId,
      task_category: category,
      days_before_deadline: daysBeforeDeadline,
      event_metadata: metadata ? JSON.stringify(metadata) : null,
      occurred_at: new Date(),
    });

    logger.info("Behavioral event recorded", { userId, eventType, category });
  }

  /**
   * Dynamically calculates if a user has a tendency to procrastinate in a task category,
   * returning an offset in hours to shift the deadline earlier.
   */
  async getEffectiveDeadlineShiftHours(userId: string, category: string): Promise<number> {
    // Query historical task completions/initiations for this user and category
    const events = await db("behavioral_events")
      .where({ user_id: userId, task_category: category, event_type: "task-initiated" })
      .orderBy("occurred_at", "desc")
      .limit(10);

    if (events.length === 0) {
      return 0; // No behavioral evidence yet
    }

    // Calculate average days before deadline the user initiates
    let sumDays = 0;
    let count = 0;
    for (const e of events) {
      if (e.days_before_deadline !== null) {
        sumDays += Number(e.days_before_deadline);
        count++;
      }
    }

    const averageDaysBefore = count > 0 ? sumDays / count : 3;

    // Behavioral Rules:
    // 1. If user initiates within 6 hours of deadline (average < 0.25 days): shift 18 hours earlier.
    // 2. If user initiates within 24 hours of deadline (average < 1.0 day): shift 12 hours earlier.
    // 3. If user initiates within 48 hours of deadline (average < 2.0 days): shift 6 hours earlier.
    if (averageDaysBefore < 0.25) {
      return 18;
    } else if (averageDaysBefore < 1.0) {
      return 12;
    } else if (averageDaysBefore < 2.0) {
      return 6;
    }

    return 0;
  }

  /**
   * Calculates the behavior-adjusted effective deadline.
   */
  async calculateEffectiveDeadline(
    userId: string,
    category: string,
    baseDeadline: Date
  ): Promise<Date> {
    const shiftHours = await this.getEffectiveDeadlineShiftHours(userId, category);
    if (shiftHours === 0) {
      return baseDeadline;
    }

    const adjusted = new Date(baseDeadline.getTime() - shiftHours * 60 * 60 * 1000);
    logger.info(
      "Context Engine adjusted effective deadline earlier due to learned behavioral traits",
      {
        userId,
        category,
        shiftHours,
        original: baseDeadline.toISOString(),
        adjusted: adjusted.toISOString(),
      }
    );
    return adjusted;
  }
}
