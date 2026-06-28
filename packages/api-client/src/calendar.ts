// ─────────────────────────────────────────────────────────────
// LastMinute — Calendar API Functions
// /api/v1/calendar/* endpoints
// ─────────────────────────────────────────────────────────────

import type { KyInstance } from "ky";
import type {
  ApiResponse,
  AvailabilityWindow,
  CalendarProviderPublic,
  ConnectProviderResponse,
  FocusBlock,
  UUID,
} from "@lastminute/types";
import type {
  ConnectProviderInput,
  AvailabilityQuery,
  CreateFocusBlockInput,
} from "@lastminute/schemas";
import { toSearchParams } from "./client.js";

/** Returns connected calendar providers with sync status. */
export async function getProviders(
  client: KyInstance
): Promise<ApiResponse<CalendarProviderPublic[]>> {
  return client.get("api/v1/calendar/providers").json();
}

/** Initiates OAuth flow for a calendar provider. Returns auth URL. */
export async function connectProvider(
  client: KyInstance,
  input: ConnectProviderInput
): Promise<ApiResponse<ConnectProviderResponse>> {
  return client.post("api/v1/calendar/providers/connect", { json: input }).json();
}

/** Disconnects a calendar provider and revokes tokens. */
export async function disconnectProvider(client: KyInstance, providerId: UUID): Promise<void> {
  await client.delete(`api/v1/calendar/providers/${providerId}`);
}

/** Returns available time windows for a date range. */
export async function getAvailability(
  client: KyInstance,
  query: AvailabilityQuery
): Promise<ApiResponse<AvailabilityWindow[]>> {
  return client
    .get("api/v1/calendar/availability", {
      searchParams: toSearchParams(query as Record<string, string | number | boolean | undefined>),
    })
    .json();
}

/** Requests the system to schedule a focus block for a task. */
export async function createFocusBlock(
  client: KyInstance,
  input: CreateFocusBlockInput
): Promise<ApiResponse<FocusBlock>> {
  return client.post("api/v1/calendar/focus-blocks", { json: input }).json();
}

/** Cancels a previously scheduled focus block. */
export async function cancelFocusBlock(client: KyInstance, blockId: UUID): Promise<void> {
  await client.delete(`api/v1/calendar/focus-blocks/${blockId}`);
}
