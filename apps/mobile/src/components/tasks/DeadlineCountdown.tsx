// ─────────────────────────────────────────────────────────────
// LastMinute — Deadline Countdown Component
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../../constants/colors";
import { Typography } from "../common/Typography";

interface Props {
  deadline: string;
}

export const DeadlineCountdown: React.FC<Props> = ({ deadline }) => {
  const [text, setText] = useState("");
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const target = new Date(deadline).getTime();
      const now = Date.now();
      const diffMs = target - now;
      const absoluteDiff = Math.abs(diffMs);

      const overdue = diffMs < 0;
      setIsOverdue(overdue);

      const mins = Math.floor((absoluteDiff / 1000 / 60) % 60);
      const hours = Math.floor((absoluteDiff / 1000 / 60 / 60) % 24);
      const days = Math.floor(absoluteDiff / 1000 / 60 / 60 / 24);

      if (overdue) {
        if (days > 0) setText(`Overdue by ${days}d`);
        else if (hours > 0) setText(`Overdue by ${hours}h`);
        else setText(`Overdue by ${mins}m`);
      } else {
        if (days > 0) setText(`${days}d ${hours}h left`);
        else if (hours > 0) setText(`${hours}h ${mins}m left`);
        else setText(`${mins}m left`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <View style={styles.container}>
      <Typography
        variant="caption"
        style={[styles.text, isOverdue ? styles.overdueText : styles.normalText]}
      >
        {isOverdue ? "⚠️ " : "⏳ "}
        {text}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontWeight: "600",
  },
  normalText: {
    color: colors.text.secondary,
  },
  overdueText: {
    color: colors.priority.critical,
    fontWeight: "700",
  },
});
