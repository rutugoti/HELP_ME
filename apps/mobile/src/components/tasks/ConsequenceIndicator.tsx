// ─────────────────────────────────────────────────────────────
// LastMinute — Consequence Indicator Component
// ─────────────────────────────────────────────────────────────

import React from "react";
import { StyleSheet, View } from "react-native";
import { ConsequenceSeverity } from "@lastminute/types";
import { colors } from "../../constants/colors";
import { Typography } from "../common/Typography";

interface Props {
  severity: ConsequenceSeverity;
}

export const ConsequenceIndicator: React.FC<Props> = ({ severity }) => {
  const getSeverityIcon = () => {
    switch (severity) {
      case ConsequenceSeverity.Critical:
        return { text: "💥 Critical Impact", color: colors.priority.critical };
      case ConsequenceSeverity.High:
        return { text: "⚠️ High Cost", color: colors.priority.high };
      case ConsequenceSeverity.Medium:
        return { text: "📈 Medium Cost", color: colors.priority.medium };
      case ConsequenceSeverity.Low:
        return { text: "🌱 Low Impact", color: colors.priority.low };
      default:
        return { text: "Impact", color: colors.text.secondary };
    }
  };

  const config = getSeverityIcon();

  return (
    <View style={styles.container}>
      <Typography variant="caption" style={[styles.text, { color: config.color }]}>
        {config.text}
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
    fontSize: 10,
  },
});
