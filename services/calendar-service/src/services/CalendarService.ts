// ─────────────────────────────────────────────────────────────
// LastMinute — Calendar Service Implementation
// Implements availability calculations, OAuth flow, and focus block booking per Rule 2.
// ─────────────────────────────────────────────────────────────

import { db } from "@lastminute/database";
import { CalendarProviderType, SyncStatus, FocusBlockStatus } from "@lastminute/types";
import type {
  CalendarProviderPublic,
  FocusBlock,
  AvailabilityWindow,
  CreateFocusBlockInput,
  ConnectProviderResponse,
} from "@lastminute/types";
import { ConflictError, NotFoundError, BadRequestError } from "../utils/errors.js";
import type {
  ICalendarProviderRepository,
  ICalendarEventRepository,
  IFocusBlockRepository,
  IUserPreferencesRepository,
} from "../repositories/interfaces.js";
import { logger } from "../config/logger.js";
import { randomUUID } from "crypto";

export class CalendarService {
  constructor(
    private readonly providerRepo: ICalendarProviderRepository,
    private readonly eventRepo: ICalendarEventRepository,
    private readonly focusBlockRepo: IFocusBlockRepository,
    private readonly preferencesRepo: IUserPreferencesRepository
  ) {}

  async listProviders(userId: string): Promise<CalendarProviderPublic[]> {
    const list = await this.providerRepo.listByUserId(userId);
    return list.map(
      ({
        accessTokenEncrypted: _accessTokenEncrypted,
        refreshTokenEncrypted: _refreshTokenEncrypted,
        ...rest
      }) => rest
    );
  }

  async connectProvider(
    userId: string,
    provider: CalendarProviderType
  ): Promise<ConnectProviderResponse> {
    const existing = await this.providerRepo.findByUserIdAndProvider(userId, provider);
    if (existing && existing.syncStatus !== SyncStatus.Disconnected) {
      throw new ConflictError(`Provider ${provider} is already connected.`);
    }

    // Standard redirect URIs pointing to our callback
    const redirectUri = encodeURIComponent(
      "http://localhost:3003/api/v1/calendar/providers/callback"
    );
    const state = encodeURIComponent(`${userId}:${provider}`);

    let authorizationUrl = "";
    if (provider === CalendarProviderType.Google) {
      authorizationUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=mock-google-client-id&redirect_uri=${redirectUri}&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar&state=${state}&access_type=offline&prompt=consent`;
    } else {
      authorizationUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=mock-ms-client-id&redirect_uri=${redirectUri}&response_type=code&scope=Calendars.ReadWrite&state=${state}&response_mode=query`;
    }

    return { authorizationUrl };
  }

  async handleOAuthCallback(code: string, state: string): Promise<void> {
    if (!code || !state) {
      throw new BadRequestError("Missing auth code or state parameter.");
    }

    const decoded = decodeURIComponent(state);
    const parts = decoded.split(":");
    if (parts.length !== 2) {
      throw new BadRequestError("Invalid state payload format.");
    }

    const [userId, providerStr] = parts;
    if (!userId || !providerStr) {
      throw new BadRequestError("Invalid state payload format.");
    }

    const provider = providerStr as CalendarProviderType;

    // Simulate token exchange with provider
    const accessTokenEncrypted = `encrypted_access_token_for_${code.substring(0, 10)}`;
    const refreshTokenEncrypted = `encrypted_refresh_token_for_${code.substring(0, 10)}`;
    const tokenExpiresAt = new Date(Date.now() + 3600 * 1000).toISOString(); // 1 hour expiration
    const providerAccountId = `mock-account-${userId.substring(0, 8)}`;

    const existing = await this.providerRepo.findByUserIdAndProvider(userId, provider);

    let providerId = "";
    if (existing) {
      providerId = existing.id;
      await this.providerRepo.updateTokens(
        providerId,
        accessTokenEncrypted,
        refreshTokenEncrypted,
        tokenExpiresAt
      );
      await this.providerRepo.updateSyncStatus(providerId, SyncStatus.Active, null, null);
    } else {
      const created = await this.providerRepo.create({
        userId: userId!,
        provider,
        providerAccountId,
        accessTokenEncrypted,
        refreshTokenEncrypted,
        tokenExpiresAt,
        syncStatus: SyncStatus.Active,
      });
      providerId = created.id;
    }

    logger.info("OAuth connection successful, queueing sync job", { userId, provider });

    // Trigger an immediate sync of events
    await this.syncCalendarEvents(providerId);
  }

  async disconnectProvider(userId: string, providerId: string): Promise<void> {
    const connection = await this.providerRepo.findById(providerId);
    if (!connection || connection.userId !== userId) {
      throw new NotFoundError("Connected provider not found.");
    }

    const trx = await db.transaction();
    try {
      // 1. Delete connection
      await this.providerRepo.delete(providerId, trx);

      // 2. Clear cached events
      await trx("calendar_events").where({ provider_id: providerId }).delete();

      await trx.commit();
      logger.info("Disconnected calendar provider and cleared cached events", {
        userId,
        providerId,
      });
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  }

  async syncCalendarEvents(providerId: string): Promise<void> {
    const connection = await this.providerRepo.findById(providerId);
    if (!connection) {
      throw new NotFoundError("Provider connection not found.");
    }

    try {
      // Mock fetching external events from calendar provider APIs
      const now = new Date();
      const mockEvents = [
        {
          externalEventId: "ext-event-1",
          title: "Daily Standup Meeting",
          startsAt: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1,
            10,
            0
          ).toISOString(),
          endsAt: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1,
            10,
            30
          ).toISOString(),
          isAllDay: false,
          isBusy: true,
        },
        {
          externalEventId: "ext-event-2",
          title: "Client Feedback Session",
          startsAt: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1,
            14,
            0
          ).toISOString(),
          endsAt: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1,
            15,
            30
          ).toISOString(),
          isAllDay: false,
          isBusy: true,
        },
        {
          externalEventId: "ext-event-3",
          title: "Dentist Appointment",
          startsAt: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 2,
            9,
            30
          ).toISOString(),
          endsAt: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 2,
            10,
            30
          ).toISOString(),
          isAllDay: false,
          isBusy: true,
        },
      ];

      await this.eventRepo.rebuildEventsForProvider(providerId, connection.userId, mockEvents);
      await this.providerRepo.updateSyncStatus(
        providerId,
        SyncStatus.Active,
        new Date().toISOString(),
        null
      );
      logger.info("Successfully synced calendar events", { providerId, count: mockEvents.length });
    } catch (err) {
      const error = err as Error;
      await this.providerRepo.updateSyncStatus(
        providerId,
        SyncStatus.Error,
        null,
        error.message || "Unknown synchronization error."
      );
      throw err;
    }
  }

  async getAvailability(
    userId: string,
    startDateStr: string,
    endDateStr: string,
    minimumMinutes = 30
  ): Promise<AvailabilityWindow[]> {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestError("Invalid date parameters.");
    }

    if (startDate > endDate) {
      throw new BadRequestError("startDate cannot be after endDate.");
    }

    // 1. Resolve working preferences (working hours, working days)
    const preferences = await this.preferencesRepo.findByUserId(userId);
    const workingDays = preferences?.workingDays ?? [1, 2, 3, 4, 5]; // Default Mon-Fri
    const startHourStr = preferences?.workingHoursStart ?? "09:00";
    const endHourStr = preferences?.workingHoursEnd ?? "18:00";

    const [startH, startM] = startHourStr.split(":").map(Number);
    const [endH, endM] = endHourStr.split(":").map(Number);

    // 2. Fetch cached busy events in period
    const busyEvents = await this.eventRepo.findEventsForUserInPeriod(userId, startDate, endDate);
    // 3. Fetch scheduled focus blocks in period
    const focusBlocks = await this.focusBlockRepo.listForUserInPeriod(userId, startDate, endDate);

    // Combine all blocking intervals
    const blockingIntervals: { startsAt: Date; endsAt: Date }[] = [];

    for (const event of busyEvents) {
      if (event.isBusy) {
        blockingIntervals.push({
          startsAt: new Date(event.startsAt),
          endsAt: new Date(event.endsAt),
        });
      }
    }

    for (const block of focusBlocks) {
      if (block.status !== FocusBlockStatus.Cancelled) {
        blockingIntervals.push({
          startsAt: new Date(block.startsAt),
          endsAt: new Date(block.endsAt),
        });
      }
    }

    // Sort blocking intervals by startsAt asc
    blockingIntervals.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

    const availabilityWindows: AvailabilityWindow[] = [];

    // Loop day-by-day
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);

    const endBoundary = new Date(endDate);
    endBoundary.setHours(23, 59, 59, 999);

    while (current <= endBoundary) {
      const dayOfWeek = current.getDay();

      if (workingDays.includes(dayOfWeek)) {
        // Set up the day's working window limits
        const workingStart = new Date(current);
        workingStart.setHours(startH ?? 9, startM ?? 0, 0, 0);

        const workingEnd = new Date(current);
        workingEnd.setHours(endH ?? 18, endM ?? 0, 0, 0);

        // Perform interval subtraction algorithm
        let availabilityPointer = new Date(workingStart);

        for (const block of blockingIntervals) {
          const blockStart = block.startsAt;
          const blockEnd = block.endsAt;

          // Check if block overlaps working hours
          if (blockStart >= workingEnd || blockEnd <= availabilityPointer) {
            continue; // No overlap
          }

          if (blockStart > availabilityPointer) {
            const diffMs = blockStart.getTime() - availabilityPointer.getTime();
            const durationMinutes = Math.floor(diffMs / 60000);

            if (durationMinutes >= minimumMinutes) {
              availabilityWindows.push({
                startsAt: availabilityPointer.toISOString(),
                endsAt: blockStart.toISOString(),
                durationMinutes,
              });
            }
          }

          if (blockEnd > availabilityPointer) {
            availabilityPointer = new Date(blockEnd);
          }

          if (availabilityPointer >= workingEnd) {
            break;
          }
        }

        // Remaining window after the last block
        if (availabilityPointer < workingEnd) {
          const diffMs = workingEnd.getTime() - availabilityPointer.getTime();
          const durationMinutes = Math.floor(diffMs / 60000);

          if (durationMinutes >= minimumMinutes) {
            availabilityWindows.push({
              startsAt: availabilityPointer.toISOString(),
              endsAt: workingEnd.toISOString(),
              durationMinutes,
            });
          }
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return availabilityWindows;
  }

  async scheduleFocusBlock(userId: string, input: CreateFocusBlockInput): Promise<FocusBlock> {
    // 1. Verify task exists
    const task = await db("tasks").where({ id: input.taskId, user_id: userId }).first();
    if (!task) {
      throw new NotFoundError("Associated task not found.");
    }

    const latestStart = new Date(input.latestStartBy);
    if (isNaN(latestStart.getTime())) {
      throw new BadRequestError("Invalid latestStartBy date parameter.");
    }

    // 2. Fetch user preferences
    const preferences = await this.preferencesRepo.findByUserId(userId);
    const autoSchedulePref = preferences?.autonomousSchedulingEnabled ?? false;
    const isAutonomous = autoSchedulePref && input.allowAutonomousBooking;

    // Calculate availability from now until latestStartBy + preferredDuration minutes
    const startDate = new Date();
    // Round end date to allow scheduling window buffer
    const endDate = new Date(latestStart.getTime() + input.preferredDuration * 60000 * 2);

    const availableSlots = await this.getAvailability(
      userId,
      startDate.toISOString().substring(0, 10),
      endDate.toISOString().substring(0, 10),
      input.preferredDuration
    );

    // Find the first slot starting after now and before latestStart
    const matchedSlot = availableSlots.find((slot) => {
      const slotStart = new Date(slot.startsAt);
      return (
        slotStart >= startDate &&
        slotStart <= latestStart &&
        slot.durationMinutes >= input.preferredDuration
      );
    });

    if (!matchedSlot) {
      throw new ConflictError(
        "No available focus block windows matching duration and deadline requirements."
      );
    }

    const startsAt = new Date(matchedSlot.startsAt);
    const endsAt = new Date(startsAt.getTime() + input.preferredDuration * 60000);

    const status = isAutonomous ? FocusBlockStatus.Booked : FocusBlockStatus.Pending;
    const externalEventId = isAutonomous
      ? `mock-external-event-${randomUUID().substring(0, 8)}`
      : null;

    // 3. Create FocusBlock record
    const created = await this.focusBlockRepo.create({
      userId,
      taskId: input.taskId,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      durationMinutes: input.preferredDuration,
      status,
      externalEventId,
      bookedAutonomously: isAutonomous,
    });

    logger.info("Focus block scheduled successfully", {
      blockId: created.id,
      taskId: input.taskId,
      status,
      bookedAutonomously: isAutonomous,
    });

    return created;
  }

  async cancelFocusBlock(userId: string, blockId: string): Promise<void> {
    const block = await this.focusBlockRepo.findById(blockId);
    if (!block || block.userId !== userId) {
      throw new NotFoundError("Focus block not found.");
    }

    if (block.status === FocusBlockStatus.Cancelled) {
      throw new ConflictError("Focus block is already cancelled.");
    }

    await this.focusBlockRepo.updateStatus(blockId, FocusBlockStatus.Cancelled);

    logger.info("Cancelled focus block, triggering task reprioritization log", {
      blockId,
      taskId: block.taskId,
      userId,
    });
  }
}
