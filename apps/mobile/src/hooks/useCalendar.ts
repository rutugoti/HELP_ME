// ─────────────────────────────────────────────────────────────
// LastMinute — useCalendar Hook
// ─────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { calendarApi } from "@lastminute/api-client";
import { api } from "../services/api";
import { CalendarProviderType, UUID } from "@lastminute/types";
import {
  ConnectProviderInput,
  AvailabilityQuery,
  CreateFocusBlockInput,
} from "@lastminute/schemas";

export const useCalendar = () => {
  const queryClient = useQueryClient();

  // Connected providers query
  const {
    data: providersRes,
    isLoading: isLoadingProviders,
    refetch: refetchProviders,
  } = useQuery({
    queryKey: ["calendarProviders"],
    queryFn: () => calendarApi.getProviders(api),
  });

  const providers = providersRes?.status === "success" ? providersRes.data : [];

  // Connect calendar provider mutation
  const connectMutation = useMutation({
    mutationFn: (input: ConnectProviderInput) => calendarApi.connectProvider(api, input),
  });

  // Disconnect provider mutation
  const disconnectMutation = useMutation({
    mutationFn: (providerId: UUID) => calendarApi.disconnectProvider(api, providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarProviders"] });
    },
  });

  // Fetch availability (we can query availability via query function triggered manually or react-query)
  const fetchAvailability = async (query: AvailabilityQuery) => {
    const res = await calendarApi.getAvailability(api, query);
    if (res.status === "success") {
      return res.data;
    }
    throw new Error((res.data as unknown as string) || "Failed to fetch availability");
  };

  // Create focus block mutation
  const createFocusBlockMutation = useMutation({
    mutationFn: (input: CreateFocusBlockInput) => calendarApi.createFocusBlock(api, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Cancel focus block mutation
  const cancelFocusBlockMutation = useMutation({
    mutationFn: (blockId: UUID) => calendarApi.cancelFocusBlock(api, blockId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return {
    providers,
    isLoadingProviders,
    refetchProviders,
    connectProvider: async (provider: CalendarProviderType) => {
      const res = await connectMutation.mutateAsync({ provider });
      if (res.status === "success") {
        return res.data.authorizationUrl;
      }
      throw new Error((res.data as unknown as string) || "Connection initiation failed");
    },
    isConnecting: connectMutation.isPending,
    disconnectProvider: async (providerId: UUID) => {
      await disconnectMutation.mutateAsync(providerId);
    },
    isDisconnecting: disconnectMutation.isPending,
    getAvailability: fetchAvailability,
    createFocusBlock: async (input: CreateFocusBlockInput) => {
      const res = await createFocusBlockMutation.mutateAsync(input);
      if (res.status === "success") {
        return res.data;
      }
      throw new Error((res.data as unknown as string) || "Failed to create focus block");
    },
    isCreatingFocusBlock: createFocusBlockMutation.isPending,
    cancelFocusBlock: async (blockId: UUID) => {
      await cancelFocusBlockMutation.mutateAsync(blockId);
    },
    isCancellingFocusBlock: cancelFocusBlockMutation.isPending,
  };
};
