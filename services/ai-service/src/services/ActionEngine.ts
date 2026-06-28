// ─────────────────────────────────────────────────────────────
// LastMinute — Action Engine Service
// Renders LLM prompt templates and generates personalized executable draft steps.
// ─────────────────────────────────────────────────────────────

import { db } from "@lastminute/database";
import { DraftType } from "@lastminute/types";
import type { ActionDraft } from "@lastminute/types";
import { logger } from "../config/logger.js";
import { randomUUID } from "crypto";

export interface ActionEngineContext {
  taskTitle: string;
  taskDescription: string;
  userRole: string;
  category: string;
  procrastinationPatternSummary: string;
  hoursRemaining: number;
}

export class ActionEngine {
  /**
   * Builds the structured LLM prompt template for action draft generation.
   */
  renderActionPrompt(ctx: ActionEngineContext): string {
    return `You are the LastMinute AI Action Engine.
Your goal is to generate the absolute first executable step for the user to overcome initiation friction and start working.

[Task Info]
Title: "${ctx.taskTitle}"
Description: "${ctx.taskDescription || "No description provided."}"
Category: "${ctx.category}"
Available Time: ${ctx.hoursRemaining.toFixed(1)} hours remaining until adjusted deadline.

[User Context]
Professional Role: "${ctx.userRole || "User"}"
Observed Procrastination Patterns: ${ctx.procrastinationPatternSummary}

[Instructions]
Produce a highly tactical, low-friction, concrete "Action Outline". 
Do NOT write a general checklist. Instead, detail:
1. The immediate next action taking under 5 minutes.
2. The specific setup/environment needed.
3. The reasoning based on their deadline proximity.
Keep it direct, motivating, and brief.`;
  }

  /**
   * Simulates generating a high-quality action draft outline using the prompt template.
   */
  async generateActionDraft(userId: string, taskId: string, trx = db): Promise<ActionDraft> {
    // 1. Fetch task and user details
    const task = await trx("tasks").where({ id: taskId }).first();
    if (!task) {
      throw new Error("Task not found");
    }

    const user = await trx("users").where({ id: userId }).first();
    const userRole = user?.role || "Professional";

    // 2. Fetch procrastination stats for context
    const events = await trx("behavioral_events")
      .where({ user_id: userId, task_category: task.category, event_type: "task-initiated" })
      .orderBy("occurred_at", "desc")
      .limit(5);

    let patternSummary = "No specific delay trend detected for this category yet.";
    if (events.length > 0) {
      const averageDays =
        events.reduce((sum, e) => sum + (e.days_before_deadline || 0), 0) / events.length;
      if (averageDays < 1) {
        patternSummary = `Usually delays initiation to within ${Math.round(averageDays * 24)} hours before the deadline. High initiation friction.`;
      }
    }

    const deadline = task.effective_deadline
      ? new Date(task.effective_deadline)
      : new Date(task.deadline);
    const hoursRemaining = Math.max(0, (deadline.getTime() - Date.now()) / (60 * 60 * 1000));

    // 3. Render prompt
    const prompt = this.renderActionPrompt({
      taskTitle: task.title,
      taskDescription: task.description || "",
      userRole,
      category: task.category || "General",
      procrastinationPatternSummary: patternSummary,
      hoursRemaining,
    });

    logger.info("Structured LLM prompt built for Action Engine", {
      taskId,
      userId,
      promptLength: prompt.length,
    });

    // 4. Simulate LLM output generation based on prompt constraints
    const generatedContent = `AI Action Outline for "${task.title}":
1. Immediate action item (5 mins): Open your editor, create a fresh branch named "feat/${task.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}", and write a skeleton layout.
2. Setup context: Close all messaging tabs. Open only the API specification and task description file.
3. Priority Reason: The task has ${hoursRemaining.toFixed(1)} hours remaining. Based on your pattern of starting similar tasks late, starting now prevents last-minute stress.`;

    const id = randomUUID();
    const now = new Date();

    const [row] = await trx("action_drafts")
      .insert({
        id,
        task_id: taskId,
        user_id: userId,
        draft_type: DraftType.Outline,
        content: generatedContent,
        is_active: true,
        model_version: "claude-3-5-sonnet-v1",
        prompt_version: "action-outline-v1",
        generated_at: now,
        created_at: now,
        updated_at: now,
      })
      .returning("*");

    if (!row) {
      throw new Error("Failed to insert action draft outline.");
    }

    return {
      id: row["id"] as string,
      taskId: row["task_id"] as string,
      userId: row["user_id"] as string,
      draftType: row["draft_type"] as DraftType,
      content: row["content"] as string,
      isActive: Boolean(row["is_active"]),
      modelVersion: row["model_version"] as string,
      promptVersion: row["prompt_version"] as string,
      generatedAt: new Date(row["generated_at"] as string).toISOString(),
      createdAt: new Date(row["created_at"] as string).toISOString(),
      updatedAt: new Date(row["updated_at"] as string).toISOString(),
    };
  }
}
