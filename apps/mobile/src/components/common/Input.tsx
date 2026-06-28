// ─────────────────────────────────────────────────────────────
// LastMinute — Common TextInput Component
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import {
  TextInput,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  TouchableOpacity,
  FocusEvent,
  BlurEvent,
} from "react-native";
import { colors } from "../../constants/colors";
import { spacing, radii } from "../../constants/spacing";
import { Typography } from "./Typography";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  secureTextEntry,
  containerStyle,
  inputStyle,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = (e: FocusEvent) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };
  const handleBlur = (e: BlurEvent) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Typography variant="caption" style={styles.label}>
          {label}
        </Typography>
      )}

      <View
        style={[
          styles.inputWrapper,
          styles.borderDefault,
          isFocused && styles.borderFocused,
          !!error && styles.borderError,
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <TextInput
          placeholderTextColor={colors.text.tertiary}
          style={[styles.textInput, inputStyle]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardAppearance="dark"
          {...props}
        />

        {secureTextEntry ? (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.iconRight}
            activeOpacity={0.7}
          >
            <Typography variant="caption" color={colors.accent.primary}>
              {showPassword ? "Hide" : "Show"}
            </Typography>
          </TouchableOpacity>
        ) : (
          rightIcon && <View style={styles.iconRight}>{rightIcon}</View>
        )}
      </View>

      {error && (
        <Typography
          variant="captionMuted"
          color={colors.priority.critical}
          style={styles.errorText}
        >
          {error}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: "100%", marginBottom: spacing.md },
  label: { color: colors.text.secondary, marginBottom: spacing.xs, fontWeight: "500" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.background.input,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  textInput: { flex: 1, height: "100%", color: colors.text.primary, fontSize: 15 },
  iconLeft: { marginRight: spacing.sm, justifyContent: "center", alignItems: "center" },
  iconRight: { marginLeft: spacing.sm, justifyContent: "center", alignItems: "center" },
  errorText: { marginTop: spacing.xs },
  borderDefault: { borderColor: colors.border.default },
  borderFocused: { borderColor: colors.border.focus },
  borderError: { borderColor: colors.priority.critical },
});
