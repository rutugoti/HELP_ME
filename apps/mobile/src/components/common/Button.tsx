// ─────────────────────────────────────────────────────────────
// LastMinute — Common Button Component
// ─────────────────────────────────────────────────────────────

import React from "react";
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TouchableOpacityProps,
} from "react-native";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography } from "./Typography";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  title: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  title,
  icon,
  iconPosition = "left",
  disabled,
  style,
  activeOpacity = 0.7,
  ...props
}) => {
  const isDisabled = disabled || isLoading;
  const spinnerColor =
    variant === "primary" || variant === "danger" ? colors.white : colors.accent.primary;

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      disabled={isDisabled}
      style={[
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <>
          {icon && iconPosition === "left" && icon}
          <Typography
            style={[
              styles.textBase,
              variantTextStyles[variant],
              sizeTextStyles[size],
              isDisabled && styles.disabledText,
              icon && iconPosition === "left" ? { marginLeft: spacing.sm } : undefined,
              icon && iconPosition === "right" ? { marginRight: spacing.sm } : undefined,
            ]}
          >
            {title}
          </Typography>
          {icon && iconPosition === "right" && icon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
  },
  textBase: {
    textAlign: "center",
    fontWeight: "600",
  },
  disabled: {
    backgroundColor: colors.background.secondary,
    borderColor: colors.transparent,
    opacity: 0.5,
  },
  disabledText: {
    color: colors.text.tertiary,
  },
});

const sizeStyles = StyleSheet.create({
  sm: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  md: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing["2xl"] },
});

const sizeTextStyles = StyleSheet.create({
  sm: { fontSize: 13 },
  md: { fontSize: 15 },
  lg: { fontSize: 17 },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.accent.primary },
  secondary: { backgroundColor: colors.background.tertiary },
  outline: {
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  ghost: { backgroundColor: colors.transparent },
  danger: { backgroundColor: colors.priority.critical },
});

const variantTextStyles = StyleSheet.create({
  primary: { color: colors.white },
  secondary: { color: colors.text.primary },
  outline: { color: colors.text.primary },
  ghost: { color: colors.accent.primary },
  danger: { color: colors.white },
});
