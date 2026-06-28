// ─────────────────────────────────────────────────────────────
// LastMinute — Voice Waveform Component
// Animated bars that visualise audio amplitude during voice
// recognition. Uses Animated API for smooth 60fps rendering.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Animated } from "react-native";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";

interface Props {
  /** Whether the waveform should animate. */
  isActive: boolean;
  /** Number of bars to render. Default: 5 */
  barCount?: number;
  /** Height of the tallest bar. Default: 32 */
  maxHeight?: number;
  /** Colour of the bars. Default: accent.primary */
  color?: string;
}

export const VoiceWaveform: React.FC<Props> = ({
  isActive,
  barCount = 5,
  maxHeight = 32,
  color = colors.accent.primary,
}) => {
  // Create an animated value for each bar
  const barAnims = useRef(Array.from({ length: barCount }, () => new Animated.Value(0.3))).current;

  useEffect(() => {
    if (isActive) {
      const animations = barAnims.map((anim, index) => {
        // Each bar has a slightly different delay and duration for a natural look
        const delay = index * 80;
        const duration = 350 + index * 50;

        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 0.5 + Math.random() * 0.5, // random height between 50-100%
              duration,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.2 + Math.random() * 0.3, // random low between 20-50%
              duration: duration + 50,
              useNativeDriver: true,
            }),
          ])
        );
      });

      animations.forEach((a) => a.start());

      return () => {
        animations.forEach((a) => a.stop());
        barAnims.forEach((a) => a.setValue(0.3));
      };
    } else {
      // Reset to resting state
      barAnims.forEach((anim) => {
        Animated.timing(anim, {
          toValue: 0.15,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [isActive, barAnims]);

  return (
    <View style={[styles.container, { height: maxHeight }]}>
      {barAnims.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              backgroundColor: color,
              height: maxHeight,
              transform: [{ scaleY: anim }],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  bar: {
    width: 4,
    borderRadius: 2,
    opacity: 0.9,
  },
});
