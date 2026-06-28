// ─────────────────────────────────────────────────────────────
// LastMinute — Voice Button Component
// Circular, animated microphone button that starts/stops
// voice recognition with visual feedback.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from "react";
import { StyleSheet, TouchableOpacity, Animated, View } from "react-native";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Typography } from "../common";

interface Props {
  /** Whether voice is currently listening. */
  isListening: boolean;
  /** Whether voice is currently processing. */
  isProcessing: boolean;
  /** Called when the button is pressed. */
  onPress: () => void;
  /** Size of the button. Default: 64 */
  size?: number;
}

export const VoiceButton: React.FC<Props> = ({ isListening, isProcessing, onPress, size = 64 }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation while listening
  useEffect(() => {
    if (isListening) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      glow.start();

      return () => {
        pulse.stop();
        glow.stop();
        pulseAnim.setValue(1);
        glowAnim.setValue(0);
      };
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [isListening, pulseAnim, glowAnim]);

  const buttonColor = isListening
    ? colors.priority.critical
    : isProcessing
      ? colors.priority.medium
      : colors.accent.primary;

  const emoji = isListening ? "⏹" : isProcessing ? "⏳" : "🎙";
  const label = isListening ? "Listening…" : isProcessing ? "Processing…" : "Voice";

  return (
    <View style={styles.container}>
      {isListening && (
        <Animated.View
          style={[
            styles.glowRing,
            {
              width: size + 20,
              height: size + 20,
              borderRadius: (size + 20) / 2,
              borderColor: colors.priority.critical,
              opacity: glowAnim,
            },
          ]}
        />
      )}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPress}
          disabled={isProcessing}
          style={[
            styles.button,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: buttonColor,
            },
          ]}
        >
          <Typography variant="h3" style={styles.emoji}>
            {emoji}
          </Typography>
        </TouchableOpacity>
      </Animated.View>
      <Typography variant="captionMuted" style={styles.label}>
        {label}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  emoji: {
    fontSize: 24,
    color: colors.white,
  },
  label: {
    marginTop: spacing.xs,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  glowRing: {
    position: "absolute",
    borderWidth: 3,
  },
});
