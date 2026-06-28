// ─────────────────────────────────────────────────────────────
// LastMinute — Calendar React Query Definitions
// ─────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { calendarApi, unwrapResponse } from "@lastminute/api-client";
import type { UUID } from "@lastminute/types";
import type {
  ConnectProviderInput,
  AvailabilityQuery,
  CreateFocusBlockInput,
} from "@lastminute/schemas";
import { api } from "../services/api";

// ── Query Keys ────────────────────────────────────────────

export const calendarKeys = {
  all: ["calendar"] as const,
  providers: () => [...calendarKeys.all, "providers"] as const,
  availability: (query: AvailabilityQuery) => [...calendarKeys.all, "availability", query] as const,
  focusBlocks: () => [...calendarKeys.all, "focusBlocks"] as const,
};

// ── Queries ───────────────────────────────────────────────

export const useCalendarProvidersQuery = () =>
  useQuery({
    queryKey: calendarKeys.providers(),
    queryFn: () => unwrapResponse(calendarApi.getProviders(api)),
  });

export const useAvailabilityQuery = (query: AvailabilityQuery) =>
  useQuery({
    queryKey: calendarKeys.availability(query),
    queryFn: () => unwrapResponse(calendarApi.getAvailability(api, query)),
    enabled: !!query.startDate && !!query.endDate,
  });

// ── Mutations ─────────────────────────────────────────────

export const useConnectProviderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ConnectProviderInput) =>
      unwrapResponse(calendarApi.connectProvider(api, input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.providers() });
    },
  });
};

export const useDisconnectProviderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (providerId: UUID) => calendarApi.disconnectProvider(api, providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.providers() });
    },
  });
};

export const useCreateFocusBlockMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFocusBlockInput) =>
      unwrapResponse(calendarApi.createFocusBlock(api, input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.focusBlocks() });
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
    },
  });
};

export const useCancelFocusBlockMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (blockId: UUID) => calendarApi.cancelFocusBlock(api, blockId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.focusBlocks() });
    },
  });
};
