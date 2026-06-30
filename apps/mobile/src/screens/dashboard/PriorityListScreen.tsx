// ─────────────────────────────────────────────────────────────
// LastMinute — Priority List Screen
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View, FlatList, TouchableOpacity, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography, Input, Card } from "../../components/common";
import { TaskCard, TaskCardSkeleton } from "../../components/tasks";
import { useTasks } from "../../hooks/useTasks";
import { DashboardStackParamList } from "../../navigation/types";
import { PriorityTier, TaskStatus } from "@lastminute/types";

type Props = NativeStackScreenProps<DashboardStackParamList, "PriorityList">;

const TIERS = [
  { label: "All Tiers", value: null },
  { label: "Critical", value: PriorityTier.Critical },
  { label: "High", value: PriorityTier.High },
  { label: "Medium", value: PriorityTier.Medium },
  { label: "Low", value: PriorityTier.Low },
];

const STATUSES = [
  { label: "All Statuses", value: null },
  { label: "Open", value: TaskStatus.Open },
  { label: "In Progress", value: TaskStatus.InProgress },
  { label: "Completed", value: TaskStatus.Completed },
];

export const PriorityListScreen: React.FC<Props> = ({ navigation }) => {
  const { tasks, isLoading, refetch, startTask, completeTask, updateFilters } = useTasks();
  const [search, setSearch] = useState("");
  const [selectedTier, setSelectedTier] = useState<PriorityTier | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | null>(null);

  const handleSearchChange = (text: string) => {
    setSearch(text);
    // In a real app we might run search on api, or filter locally. Let's filter locally.
  };

  const handleSelectTier = (tier: PriorityTier | null) => {
    setSelectedTier(tier);
    updateFilters({ priorityTier: tier || undefined });
  };

  const handleSelectStatus = (status: TaskStatus | null) => {
    setSelectedStatus(status);
    updateFilters({ status: status || undefined });
  };

  const filteredTasks = React.useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.description?.toLowerCase().includes(search.toLowerCase()) ?? false);
      return matchSearch;
    });
  }, [tasks, search]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Typography style={styles.backText}>←</Typography>
          </TouchableOpacity>
          <Typography variant="h2" style={styles.title}>
            Priority Rankings
          </Typography>
        </View>

        {/* Search */}
        <Input
          placeholder="Search tasks..."
          value={search}
          onChangeText={handleSearchChange}
          containerStyle={styles.searchInput}
        />

        {/* Horizontal Filters */}
        <View style={styles.filtersWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {/* Tiers */}
            {TIERS.map((tier) => {
              const isActive = selectedTier === tier.value;
              return (
                <TouchableOpacity
                  key={tier.label}
                  onPress={() => handleSelectTier(tier.value)}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                >
                  <Typography
                    variant="caption"
                    style={[styles.filterText, isActive && styles.filterTextActive]}
                  >
                    {tier.label}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {/* Statuses */}
            {STATUSES.map((status) => {
              const isActive = selectedStatus === status.value;
              return (
                <TouchableOpacity
                  key={status.label}
                  onPress={() => handleSelectStatus(status.value)}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                >
                  <Typography
                    variant="caption"
                    style={[styles.filterText, isActive && styles.filterTextActive]}
                  >
                    {status.label}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Task List */}
        {isLoading ? (
          <ScrollView style={styles.listContainer}>
            <TaskCardSkeleton />
            <TaskCardSkeleton />
            <TaskCardSkeleton />
          </ScrollView>
        ) : filteredTasks.length > 0 ? (
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskCard
                task={item}
                onPress={() => {}}
                onStart={() => startTask(item.id)}
                onComplete={() => completeTask(item.id)}
              />
            )}
            contentContainerStyle={styles.listContent}
            onRefresh={refetch}
            refreshing={isLoading}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Card style={styles.emptyCard}>
              <Typography variant="bodyMuted" align="center">
                No matching tasks found.
              </Typography>
            </Card>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  backButton: {
    marginRight: spacing.md,
    padding: spacing.xs,
  },
  backText: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.secondary,
  },
  title: {
    flex: 1,
  },
  searchInput: {
    marginBottom: spacing.md,
  },
  filtersWrapper: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  filterScroll: {
    gap: spacing.xs,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  filterChipActive: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  filterText: {
    color: colors.text.secondary,
    fontWeight: "600",
  },
  filterTextActive: {
    color: colors.white,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCard: {
    padding: spacing.xl,
    width: "100%",
    alignItems: "center",
  },
});
