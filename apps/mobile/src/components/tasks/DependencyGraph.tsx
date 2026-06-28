// ─────────────────────────────────────────────────────────────
// LastMinute — Task Dependency Graph Component
// ─────────────────────────────────────────────────────────────

import React from "react";
import { StyleSheet, View } from "react-native";
import { DependencyGraph as IDependencyGraph } from "@lastminute/types";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography, Card } from "../common";
import { DeadlineCountdown } from "./DeadlineCountdown";

interface Props {
  graph: IDependencyGraph;
}

export const DependencyGraph: React.FC<Props> = ({ graph }) => {
  const hasUpstream = graph.upstream.length > 0;
  const hasDownstream = graph.downstream.length > 0;

  return (
    <View style={styles.container}>
      {/* Upstream Tasks */}
      <View style={styles.section}>
        <Typography variant="bodyBold" style={styles.sectionTitle}>
          ⬇️ Blocked By (Must complete these first)
        </Typography>
        {hasUpstream ? (
          graph.upstream.map((node) => (
            <Card key={node.taskId} style={styles.nodeCard}>
              <View style={styles.row}>
                <Typography variant="body" style={styles.nodeTitle}>
                  {node.title}
                </Typography>
                <Typography
                  variant="caption"
                  style={[
                    styles.statusBadge,
                    node.status === "completed" ? styles.statusSuccess : styles.statusPending,
                  ]}
                >
                  {node.status}
                </Typography>
              </View>
              <View style={styles.footer}>
                <DeadlineCountdown deadline={node.deadline} />
              </View>
            </Card>
          ))
        ) : (
          <Typography variant="caption" color={colors.text.secondary} style={styles.emptyText}>
            No upstream blockers.
          </Typography>
        )}
      </View>

      {/* Downstream Tasks */}
      <View style={styles.section}>
        <Typography variant="bodyBold" style={styles.sectionTitle}>
          ⬆️ Blocking (These depend on this task)
        </Typography>
        {hasDownstream ? (
          graph.downstream.map((node) => (
            <Card key={node.taskId} style={styles.nodeCard}>
              <View style={styles.row}>
                <Typography variant="body" style={styles.nodeTitle}>
                  {node.title}
                </Typography>
                <Typography
                  variant="caption"
                  style={[
                    styles.statusBadge,
                    node.status === "completed" ? styles.statusSuccess : styles.statusPending,
                  ]}
                >
                  {node.status}
                </Typography>
              </View>
              <View style={styles.footer}>
                <DeadlineCountdown deadline={node.deadline} />
              </View>
            </Card>
          ))
        ) : (
          <Typography variant="caption" color={colors.text.secondary} style={styles.emptyText}>
            This task is not blocking any other tasks.
          </Typography>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  section: {
    marginVertical: spacing.xs,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  nodeCard: {
    padding: spacing.md,
    marginVertical: spacing.xxs,
    backgroundColor: colors.background.secondary,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  nodeTitle: {
    fontWeight: "600",
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
    overflow: "hidden",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  statusSuccess: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    color: "#10b981",
  },
  statusPending: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    color: "#ef4444",
  },
  footer: {
    marginTop: spacing.xxs,
  },
  emptyText: {
    fontStyle: "italic",
    paddingLeft: spacing.sm,
    marginTop: spacing.xxs,
  },
});
