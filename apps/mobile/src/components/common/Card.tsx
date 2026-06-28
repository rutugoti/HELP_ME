// ─────────────────────────────────────────────────────────────
// LastMinute — Common Card Component
// ─────────────────────────────────────────────────────────────

import React from "react";
import { StyleSheet, View, ViewStyle, TouchableOpacity } from "react-native";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";

export interface CardProps {
  onPress?: () => void;
  style?: ViewStyle;
  variant?: "primary" | "secondary" | "outline";
  noPadding?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  onPress,
  style,
  variant = "primary",
  noPadding = false,
  children,
}) => {
  const cardStyle = [styles.card, variantStyles[variant], noPadding && styles.noPadding, style];

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={cardStyle}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginVertical: spacing.xs,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  noPadding: { padding: 0 },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  secondary: {
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  outline: {
    backgroundColor: colors.transparent,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    elevation: 0,
    shadowOpacity: 0,
  },
});
