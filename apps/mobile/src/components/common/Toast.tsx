// ─────────────────────────────────────────────────────────────
// LastMinute — Common Toast Component
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from "react";
import { StyleSheet, Animated, Platform, ViewStyle } from "react-native";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography } from "./Typography";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
  style?: ViewStyle;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = "info",
  duration = 3000,
  onClose,
  style,
}) => {
  const slideAnim = useRef(new Animated.Value(-150)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: Platform.OS === "ios" ? 10 : 40,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }).start();

      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      Animated.timing(slideAnim, {
        toValue: -150,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -150,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.toast, variantStyles[type], { transform: [{ translateY: slideAnim }] }, style]}
    >
      <Typography variant="bodyBold" style={[styles.text, textStyles[type]]}>
        {message}
      </Typography>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    padding: spacing.md,
    borderRadius: radii.md,
    zIndex: 10000,
    elevation: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  text: {
    fontSize: 14,
    textAlign: "center",
  },
});

const variantStyles = StyleSheet.create({
  success: { backgroundColor: colors.status.successBg, borderColor: colors.status.success },
  error: { backgroundColor: colors.status.errorBg, borderColor: colors.status.error },
  info: { backgroundColor: colors.status.infoBg, borderColor: colors.status.info },
  warning: { backgroundColor: colors.status.warningBg, borderColor: colors.status.warning },
});

const textStyles = StyleSheet.create({
  success: { color: colors.status.success },
  error: { color: colors.status.error },
  info: { color: colors.status.info },
  warning: { color: colors.status.warning },
});
