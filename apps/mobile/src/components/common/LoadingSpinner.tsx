// ─────────────────────────────────────────────────────────────
// LastMinute — Common LoadingSpinner Component
// ─────────────────────────────────────────────────────────────

import React from "react";
import { View, ActivityIndicator, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Typography } from "./Typography";

export interface LoadingSpinnerProps {
  message?: string;
  size?: "small" | "large";
  color?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  size = "large",
  color = colors.accent.primary,
  fullScreen = false,
  style,
}) => {
  const containerStyle = [styles.container, fullScreen && styles.fullScreen, style];

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Typography variant="bodyMuted" style={styles.message}>
          {message}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  fullScreen: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    zIndex: 9999,
  },
  message: {
    marginTop: spacing.md,
    fontWeight: "500",
  },
});
