// ─────────────────────────────────────────────────────────────
// LastMinute — Common Avatar Component
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { View, Image, StyleSheet, ViewStyle, StyleProp, ImageStyle } from "react-native";
import { colors } from "../../constants/colors";
import { Typography } from "./Typography";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

export interface AvatarProps {
  name: string;
  sourceUrl?: string | null;
  size?: AvatarSize;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({ name, sourceUrl, size = "md", style }) => {
  const [hasError, setHasError] = useState(false);
  const sizeValue = sizeMap[size];

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const containerStyle = [
    styles.avatar,
    { width: sizeValue, height: sizeValue, borderRadius: sizeValue / 2 },
    style,
  ];

  if (sourceUrl && !hasError) {
    return (
      <Image
        source={{ uri: sourceUrl }}
        onError={() => setHasError(true)}
        style={containerStyle as StyleProp<ImageStyle>}
      />
    );
  }

  return (
    <View style={[containerStyle, styles.fallbackContainer]}>
      <Typography variant="bodyBold" color={colors.white} style={{ fontSize: sizeValue * 0.4 }}>
        {getInitials(name)}
      </Typography>
    </View>
  );
};

const sizeMap = {
  sm: 32,
  md: 44,
  lg: 60,
  xl: 80,
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.background.tertiary,
  },
  fallbackContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.accent.primary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
});
