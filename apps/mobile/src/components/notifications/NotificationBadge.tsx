// ─────────────────────────────────────────────────────────────
// LastMinute — Notification Badge Component
// ─────────────────────────────────────────────────────────────

import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../../constants/colors";
import { Typography } from "../common";

interface Props {
  count: number;
}

export const NotificationBadge: React.FC<Props> = ({ count }) => {
  if (count <= 0) return null;

  return (
    <View style={styles.badge}>
      <Typography variant="caption" style={styles.text}>
        {count > 9 ? "9+" : count}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    right: -6,
    top: -4,
    backgroundColor: colors.priority.critical,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 2,
    borderWidth: 1.5,
    borderColor: colors.background.primary,
  },
  text: {
    color: colors.white,
    fontSize: 9,
    fontWeight: "bold",
  },
});
