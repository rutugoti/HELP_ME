// ─────────────────────────────────────────────────────────────
// LastMinute — Transcript Preview Component
// Shows the live transcript text, parsed task preview,
// and action buttons (use / discard).
// ─────────────────────────────────────────────────────────────

import React from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography, Card, Button } from "../common";

interface ParsedTask {
  title: string;
  description: string;
  category: string;
}

interface Props {
  /** The current transcript text. */
  transcript: string;
  /** Whether the transcript is being processed. */
  isProcessing: boolean;
  /** Confidence score (0-1). */
  confidence: number;
  /** Parsed task fields (available after processing). */
  parsedTask: ParsedTask | null;
  /** Called when the user wants to create a task from the transcript. */
  onUseTranscript: (parsed: ParsedTask) => void;
  /** Called when the user discards the transcript. */
  onDiscard: () => void;
}

export const TranscriptPreview: React.FC<Props> = ({
  transcript,
  isProcessing,
  confidence,
  parsedTask,
  onUseTranscript,
  onDiscard,
}) => {
  if (!transcript && !isProcessing) return null;

  return (
    <Card style={styles.card}>
      {/* Live Transcript */}
      <View style={styles.transcriptSection}>
        <Typography variant="captionMuted" style={styles.sectionLabel}>
          TRANSCRIPT
        </Typography>
        {transcript ? (
          <Typography variant="body" style={styles.transcriptText}>
            "{transcript}"
          </Typography>
        ) : (
          <Typography variant="bodyMuted" style={styles.transcriptText}>
            Listening for voice input…
          </Typography>
        )}
        {confidence > 0 && (
          <Typography variant="captionMuted" style={styles.confidence}>
            Confidence: {(confidence * 100).toFixed(0)}%
          </Typography>
        )}
      </View>

      {/* Processing Spinner */}
      {isProcessing && (
        <View style={styles.processingRow}>
          <ActivityIndicator size="small" color={colors.accent.primary} />
          <Typography variant="caption" color={colors.text.secondary} style={styles.processingText}>
            Parsing transcript with AI…
          </Typography>
        </View>
      )}

      {/* Parsed Task Preview */}
      {parsedTask && !isProcessing && (
        <View style={styles.parsedSection}>
          <Typography variant="captionMuted" style={styles.sectionLabel}>
            PARSED TASK
          </Typography>
          <View style={styles.parsedRow}>
            <Typography variant="caption" color={colors.text.secondary}>
              Title:
            </Typography>
            <Typography variant="bodyBold" style={styles.parsedValue}>
              {parsedTask.title}
            </Typography>
          </View>
          <View style={styles.parsedRow}>
            <Typography variant="caption" color={colors.text.secondary}>
              Category:
            </Typography>
            <Typography variant="caption" style={styles.categoryBadge}>
              {parsedTask.category.toUpperCase()}
            </Typography>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              variant="primary"
              size="sm"
              title="Create Task"
              onPress={() => onUseTranscript(parsedTask)}
              style={styles.actionBtn}
            />
            <Button
              variant="outline"
              size="sm"
              title="Discard"
              onPress={onDiscard}
              style={styles.actionBtn}
            />
          </View>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderColor: colors.border.focus,
    borderWidth: 1,
    backgroundColor: colors.background.secondary,
  },
  transcriptSection: {
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: spacing.xxs,
    color: colors.accent.primary,
  },
  transcriptText: {
    fontStyle: "italic",
    lineHeight: 20,
  },
  confidence: {
    marginTop: spacing.xxs,
    fontSize: 10,
  },
  processingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  processingText: {
    fontSize: 12,
  },
  parsedSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingTop: spacing.sm,
  },
  parsedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xxs,
  },
  parsedValue: {
    fontSize: 13,
    flex: 1,
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: colors.accent.primary,
    borderColor: colors.accent.primary,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    overflow: "hidden",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionBtn: {
    height: 32,
    paddingHorizontal: spacing.md,
  },
});
