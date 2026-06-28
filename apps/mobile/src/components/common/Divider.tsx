// ─────────────────────────────────────────────────────────────
// LastMinute — Common Divider Component
// ─────────────────────────────────────────────────────────────

import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Typography } from "./Typography";

export interface DividerProps {
  text?: string;
  marginVertical?: keyof typeof spacing;
  style?: ViewStyle;
  orientation?: "horizontal" | "vertical";
}

export const Divider: React.FC<DividerProps> = ({
  text,
  marginVertical = "md",
  style,
  orientation = "horizontal",
}) => {
  const margin = spacing[marginVertical];

  if (orientation === "vertical") {
    return <View style={[styles.verticalLine, { marginHorizontal: margin }, style]} />;
  }

  if (text) {
    return (
      <View style={[styles.container, { marginVertical: margin }, style]}>
        <View style={styles.line} />
        <Typography variant="caption" style={styles.text}>
          {text}
        </Typography>
        <View style={styles.line} />
      </View>
    );
  }

  return <View style={[styles.line, { marginVertical: margin }, style]} />;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.default,
  },
  text: {
    paddingHorizontal: spacing.md,
    color: colors.text.tertiary,
    fontSize: 12,
    fontWeight: "500",
  },
  verticalLine: {
    width: 1,
    height: "100%",
    backgroundColor: colors.border.default,
  },
});
