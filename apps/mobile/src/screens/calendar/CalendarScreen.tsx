// ─────────────────────────────────────────────────────────────
// LastMinute — Calendar Screen
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View, ScrollView, ActivityIndicator, Linking } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { CalendarStackParamList } from "../../navigation/types";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Typography, Card, Button } from "../../components/common";
import { CalendarStrip, AvailabilitySlot, ProviderBadge } from "../../components/calendar";
import { useCalendar } from "../../hooks/useCalendar";
import { CalendarProviderType } from "@lastminute/types";

type Props = NativeStackScreenProps<CalendarStackParamList, "CalendarMain">;

export const CalendarScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const {
    providers,
    isLoadingProviders,
    connectProvider,
    isConnecting,
    disconnectProvider,
    isDisconnecting,
    getAvailability,
  } = useCalendar();

  // Format date to YYYY-MM-DD
  const formatDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const dateStr = formatDateString(selectedDate);

  // Fetch availability for the selected date
  const {
    data: slots = [],
    isLoading: isLoadingSlots,
    error,
  } = useQuery({
    queryKey: ["availability", dateStr],
    queryFn: () => getAvailability({ startDate: dateStr, endDate: dateStr }),
    enabled: providers.length > 0, // only fetch if a provider is connected
  });

  const handleConnect = async (providerType: CalendarProviderType) => {
    try {
      const authUrl = await connectProvider(providerType);
      const supported = await Linking.canOpenURL(authUrl);
      if (supported) {
        await Linking.openURL(authUrl);
      }
    } catch {
      // Ignored or handled silently
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Typography variant="h2" style={styles.header}>
          Calendar Sync
        </Typography>

        {/* Connected Providers Section */}
        <Typography variant="bodyBold" style={styles.sectionTitle}>
          Connected Accounts
        </Typography>

        {isLoadingProviders ? (
          <ActivityIndicator size="small" color={colors.accent.primary} style={styles.spinner} />
        ) : providers.length > 0 ? (
          providers.map((p) => (
            <ProviderBadge
              key={p.id}
              provider={p}
              onDisconnect={() => disconnectProvider(p.id)}
              isDisconnecting={isDisconnecting}
            />
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Typography variant="bodyMuted" align="center" style={styles.emptyText}>
              No calendars connected yet. Connect an account to sync slots.
            </Typography>

            <View style={styles.connectButtons}>
              <Button
                variant="primary"
                size="sm"
                title="Connect Google"
                onPress={() => handleConnect(CalendarProviderType.Google)}
                isLoading={isConnecting}
                style={styles.connectBtn}
              />
              <Button
                variant="outline"
                size="sm"
                title="Connect Outlook"
                onPress={() => handleConnect(CalendarProviderType.Microsoft)}
                isLoading={isConnecting}
                style={styles.connectBtn}
              />
            </View>
          </Card>
        )}

        {/* Date Selector and Available slots */}
        {providers.length > 0 && (
          <>
            <Typography variant="bodyBold" style={styles.sectionTitle}>
              Select Schedule Date
            </Typography>

            <CalendarStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />

            <View style={styles.slotsHeader}>
              <Typography variant="bodyBold">Available Focus Windows</Typography>
              <Button
                variant="ghost"
                size="sm"
                title="Configure Settings"
                onPress={() => navigation.navigate("Availability")}
              />
            </View>

            {isLoadingSlots ? (
              <ActivityIndicator
                size="large"
                color={colors.accent.primary}
                style={styles.spinner}
              />
            ) : error ? (
              <Card style={styles.errorCard}>
                <Typography variant="caption" color={colors.priority.critical}>
                  ⚠️ Failed to load availability: {error.message}
                </Typography>
              </Card>
            ) : slots.length > 0 ? (
              slots.map((slot, index) => (
                <AvailabilitySlot
                  key={index}
                  slot={slot}
                  onBook={() =>
                    navigation.navigate("FocusBlock", {
                      startsAt: slot.startsAt,
                      endsAt: slot.endsAt,
                      durationMinutes: slot.durationMinutes,
                    })
                  }
                />
              ))
            ) : (
              <Card style={styles.emptyCard}>
                <Typography variant="bodyMuted" align="center">
                  No free availability windows found for this day.
                </Typography>
              </Card>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    fontSize: 15,
  },
  spinner: {
    marginVertical: spacing.lg,
  },
  emptyCard: {
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.md,
  },
  emptyText: {
    marginBottom: spacing.xs,
  },
  connectButtons: {
    flexDirection: "row",
    gap: spacing.sm,
    width: "100%",
  },
  connectBtn: {
    flex: 1,
  },
  slotsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  errorCard: {
    padding: spacing.md,
    borderColor: colors.priority.critical,
    borderWidth: 1,
  },
});
