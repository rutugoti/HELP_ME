// ─────────────────────────────────────────────────────────────
// LastMinute — User Profile & Preferences Service
// Implements profile updates, preference updates, and productivity statistics.
// ─────────────────────────────────────────────────────────────

import type {
  UpdatePreferencesInput,
  UpdateUserInput,
  UserPreferences,
  UserPublic,
  UserStats,
  User,
} from "@lastminute/types";
import { logger } from "../config/logger.js";
import type { IUserPreferencesRepository, IUserRepository } from "../repositories/interfaces.js";
import { NotFoundError } from "../utils/errors.js";
import type { IUserService } from "./interfaces.js";

export class UserService implements IUserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userPreferencesRepository: IUserPreferencesRepository
  ) {}

  async getProfile(userId: string): Promise<UserPublic> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found.");
    }

    const publicUser = { ...user } as Omit<User, "passwordHash" | "deletedAt"> & {
      passwordHash?: string;
      deletedAt?: string | null;
    };
    delete publicUser.passwordHash;
    delete publicUser.deletedAt;

    return publicUser as UserPublic;
  }

  async updateProfile(userId: string, input: UpdateUserInput): Promise<UserPublic> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found.");
    }

    // If timezone is updated, trigger timezone change events
    if (input.timezone && input.timezone !== user.timezone) {
      logger.info("User timezone changed, upcoming task deadlines will be recalculated", {
        userId,
        oldTimezone: user.timezone,
        newTimezone: input.timezone,
      });
      // In a later session, this would publish a task.timezone-changed event to RabbitMQ
    }

    const updatedUser = await this.userRepository.update(userId, {
      fullName: input.fullName,
      timezone: input.timezone,
    });

    const publicUser = { ...updatedUser } as Omit<User, "passwordHash" | "deletedAt"> & {
      passwordHash?: string;
      deletedAt?: string | null;
    };
    delete publicUser.passwordHash;
    delete publicUser.deletedAt;

    return publicUser as UserPublic;
  }

  async getPreferences(userId: string): Promise<UserPreferences> {
    const prefs = await this.userPreferencesRepository.findByUserId(userId);
    if (!prefs) {
      throw new NotFoundError("Preferences for this user do not exist.");
    }
    return prefs;
  }

  async updatePreferences(userId: string, input: UpdatePreferencesInput): Promise<UserPreferences> {
    // Check if user preferences exist first
    const existing = await this.userPreferencesRepository.findByUserId(userId);
    if (!existing) {
      throw new NotFoundError("Preferences not found.");
    }

    const updated = await this.userPreferencesRepository.update(userId, {
      notificationLowChannels: input.notificationLowChannels,
      notificationMediumChannels: input.notificationMediumChannels,
      notificationHighChannels: input.notificationHighChannels,
      notificationCriticalChannels: input.notificationCriticalChannels,
      workingHoursStart: input.workingHoursStart,
      workingHoursEnd: input.workingHoursEnd,
      workingDays: input.workingDays,
      voiceEnabled: input.voiceEnabled,
      autonomousSchedulingEnabled: input.autonomousSchedulingEnabled,
      contentPrivacyMode: input.contentPrivacyMode,
      escalationContactEmail: input.escalationContactEmail,
      escalationContactName: input.escalationContactName,
      escalationThreshold: input.escalationThreshold,
    });

    logger.info("User preferences updated", { userId });
    return updated;
  }

  async getStats(userId: string): Promise<UserStats> {
    const userExists = await this.userRepository.findById(userId);
    if (!userExists) {
      throw new NotFoundError("User not found.");
    }

    const stats = await this.userRepository.getUserStats(userId);
    logger.debug("Fetched user stats", { userId });
    return stats;
  }
}
