// ─────────────────────────────────────────────────────────────
// LastMinute — useInsights Hook
// ─────────────────────────────────────────────────────────────

import { useQuery } from "@tanstack/react-query";
import { aiApi, usersApi } from "@lastminute/api-client";
import { api } from "../services/api";

export const useInsights = () => {
  // Query to fetch behavioral insights
  const {
    data: insightsRes,
    isLoading: isLoadingInsights,
    error: insightsError,
    refetch: refetchInsights,
  } = useQuery({
    queryKey: ["behavioralInsights"],
    queryFn: () => aiApi.getInsights(api),
  });

  const insights = insightsRes?.status === "success" ? insightsRes.data : null;

  // Query to fetch aggregated stats
  const {
    data: statsRes,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["productivityStats"],
    queryFn: () => usersApi.getStats(api),
  });

  const stats = statsRes?.status === "success" ? statsRes.data : null;

  return {
    insights,
    stats,
    isLoading: isLoadingInsights || isLoadingStats,
    error: insightsError || statsError,
    refetch: async () => {
      await Promise.all([refetchInsights(), refetchStats()]);
    },
  };
};
