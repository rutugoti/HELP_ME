// ─────────────────────────────────────────────────────────────
// LastMinute — Common EmptyState Component
// ─────────────────────────────────────────────────────────────

import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Typography } from "./Typography";
import { Button } from "./Button";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionTitle?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionTitle,
  onActionPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Typography variant="h3" align="center" style={styles.title}>
        {title}
      </Typography>
      <Typography variant="bodyMuted" align="center" style={styles.description}>
        {description}
      </Typography>
      {actionTitle && onActionPress && (
        <Button
          variant="outline"
          title={actionTitle}
          onPress={onActionPress}
          style={styles.action}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing["2xl"],
    backgroundColor: colors.transparent,
  },
  iconContainer: {
    marginBottom: spacing.lg,
    opacity: 0.8,
  },
  title: {
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  description: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  action: {
    minWidth: 160,
  },
});
