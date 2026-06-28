// ─────────────────────────────────────────────────────────────
// LastMinute — Action Draft Card Component
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { StyleSheet, View, TextInput, ActivityIndicator, Clipboard } from "react-native";
import { ActionDraft, FeedbackType } from "@lastminute/types";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography, Card, Button } from "../common";

interface Props {
  draft: ActionDraft;
  onSubmitFeedback: (input: { feedbackType: FeedbackType; notes?: string }) => Promise<void>;
  isSubmittingFeedback: boolean;
}

export const ActionDraftCard: React.FC<Props> = ({
  draft,
  onSubmitFeedback,
  isSubmittingFeedback,
}) => {
  const [notes, setNotes] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    Clipboard.setString(draft.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = async (type: FeedbackType) => {
    try {
      await onSubmitFeedback({ feedbackType: type, notes: notes || undefined });
      setFeedbackSuccess(true);
      setNotes("");
      setTimeout(() => setFeedbackSuccess(false), 3000);
    } catch {
      // Handled silently or via parent
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Typography variant="bodyBold" color={colors.accent.primary} style={styles.draftType}>
          🤖 AI {draft.draftType.toUpperCase()} DRAFT
        </Typography>
        <Typography variant="captionMuted">v{draft.modelVersion}</Typography>
      </View>

      <View style={styles.contentContainer}>
        <Typography variant="body" style={styles.content}>
          {draft.content}
        </Typography>
      </View>

      <View style={styles.actionRow}>
        <Button
          variant="outline"
          title={copied ? "Copied ✓" : "Copy Draft"}
          onPress={handleCopy}
          style={styles.copyButton}
        />
      </View>

      {/* Feedback Section */}
      <View style={styles.feedbackSection}>
        <Typography variant="caption" style={styles.feedbackTitle}>
          Was this helpful? Submit feedback to improve outputs.
        </Typography>

        <TextInput
          style={styles.input}
          placeholder="Optional notes or edits..."
          placeholderTextColor={colors.text.secondary}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        {feedbackSuccess ? (
          <Typography variant="caption" color={colors.priority.low} style={styles.successText}>
            Thank you for your feedback!
          </Typography>
        ) : isSubmittingFeedback ? (
          <ActivityIndicator size="small" color={colors.accent.primary} />
        ) : (
          <View style={styles.feedbackButtons}>
            <Button
              variant="outline"
              size="sm"
              title="Used As Is"
              onPress={() => handleFeedback(FeedbackType.UsedAsIs)}
              style={styles.fbBtn}
            />
            <Button
              variant="outline"
              size="sm"
              title="Inaccurate"
              onPress={() => handleFeedback(FeedbackType.Inaccurate)}
              style={styles.fbBtn}
            />
            <Button
              variant="outline"
              size="sm"
              title="Too Generic"
              onPress={() => handleFeedback(FeedbackType.TooGeneric)}
              style={styles.fbBtn}
            />
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  draftType: {
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 0.8,
  },
  contentContainer: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  content: {
    lineHeight: 20,
    fontFamily: "monospace",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: spacing.lg,
  },
  copyButton: {
    height: 32,
    paddingHorizontal: spacing.md,
  },
  feedbackSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingTop: spacing.md,
  },
  feedbackTitle: {
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background.input,
    color: colors.text.primary,
    borderRadius: radii.sm,
    padding: spacing.sm,
    minHeight: 60,
    fontSize: 12,
    marginBottom: spacing.md,
    textAlignVertical: "top",
  },
  feedbackButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  smallBtn: {
    height: 28,
    paddingHorizontal: spacing.sm,
  },
  smallBtnText: {
    fontSize: 10,
    fontWeight: "600",
  },
  fbBtn: {
    flex: 1,
    minWidth: 90,
  },
  successText: {
    fontWeight: "700",
    textAlign: "center",
    marginVertical: spacing.xs,
  },
});
