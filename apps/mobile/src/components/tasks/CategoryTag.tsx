// ─────────────────────────────────────────────────────────────
// LastMinute — Category Tag Component
// ─────────────────────────────────────────────────────────────

import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography } from "../common/Typography";

interface Props {
  category: string;
}

export const CategoryTag: React.FC<Props> = ({ category }) => {
  const getCategoryColor = () => {
    // Return standard category colors or accent shades
    switch (category.toLowerCase()) {
      case "work":
      case "professional":
        return colors.accent.primary;
      case "personal":
      case "health":
        return colors.accent.secondary;
      case "admin":
      case "finance":
        return "#e0a82e";
      default:
        return colors.text.secondary;
    }
  };

  const tagColor = getCategoryColor();

  return (
    <View style={[styles.tag, { borderColor: tagColor }]}>
      <Typography variant="caption" style={[styles.text, { color: tagColor }]}>
        {category}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderRadius: radii.sm,
    borderWidth: 1,
    alignSelf: "flex-start",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
