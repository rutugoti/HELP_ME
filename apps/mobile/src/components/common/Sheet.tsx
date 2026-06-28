// ─────────────────────────────────────────────────────────────
// LastMinute — Common Sheet Component (Bottom Sheet Modal)
// ─────────────────────────────────────────────────────────────

import React from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  SafeAreaView,
  ViewStyle,
} from "react-native";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography } from "./Typography";

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  style?: ViewStyle;
  children: React.ReactNode;
}

export const Sheet: React.FC<SheetProps> = ({ visible, onClose, title, style, children }) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={[styles.sheetContent, style]}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            {title && (
              <View style={styles.header}>
                <Typography variant="h3" style={styles.title}>
                  {title}
                </Typography>
                <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                  <Typography variant="body" color={colors.accent.primary}>
                    Done
                  </Typography>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.body}>{children}</View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.overlay.backdrop,
  },
  sheetContent: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    maxHeight: "85%",
  },
  safeArea: {
    width: "100%",
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border.default,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  title: {
    color: colors.text.primary,
  },
  body: {
    padding: spacing.lg,
  },
});
