// ─────────────────────────────────────────────────────────────
// LastMinute — Common Typography Component
// ─────────────────────────────────────────────────────────────

import React from "react";
import { Text, StyleSheet, TextStyle, TextProps } from "react-native";
import { colors } from "../../constants/colors";
import { typography, FontSizeKey, FontWeightKey } from "../../constants/typography";

export type TypographyVariant =
  "h1" | "h2" | "h3" | "body" | "bodyBold" | "bodyMuted" | "caption" | "captionMuted" | "mono";

export interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: "auto" | "left" | "right" | "center" | "justify";
  size?: FontSizeKey;
  weight?: FontWeightKey;
  children: React.ReactNode;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = "body",
  color,
  align,
  size,
  weight,
  style,
  children,
  ...props
}) => {
  const custom: TextStyle = {};
  if (color) custom.color = color;
  if (align) custom.textAlign = align;
  if (size) custom.fontSize = typography.fontSize[size];
  if (weight) custom.fontWeight = typography.fontWeight[weight];

  return (
    <Text style={[styles[variant], custom, style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.fontSize.xxxl * typography.lineHeight.tight,
    color: colors.text.primary,
  },
  h2: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.fontSize.xl * typography.lineHeight.tight,
    color: colors.text.primary,
  },
  h3: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.fontSize.lg * typography.lineHeight.tight,
    color: colors.text.primary,
  },
  body: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    color: colors.text.primary,
  },
  bodyBold: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    color: colors.text.primary,
  },
  bodyMuted: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    color: colors.text.secondary,
  },
  caption: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    color: colors.text.secondary,
  },
  captionMuted: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
    color: colors.text.tertiary,
  },
  mono: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
  },
});
