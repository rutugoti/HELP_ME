// ─────────────────────────────────────────────────────────────
// LastMinute — Common ErrorBoundary Component
// ─────────────────────────────────────────────────────────────

import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Typography } from "./Typography";
import { Button } from "./Button";

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught unhandled error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.card}>
              <Typography variant="h2" align="center" style={styles.title}>
                Something went wrong
              </Typography>
              <Typography variant="bodyMuted" align="center" style={styles.description}>
                An unexpected error occurred. We have logged this event for review.
              </Typography>
              {this.state.error && (
                <View style={styles.errorBox}>
                  <Typography variant="mono" style={styles.errorText}>
                    {this.state.error.name}: {this.state.error.message}
                  </Typography>
                </View>
              )}
              <Button
                variant="primary"
                title="Try Again"
                onPress={this.handleReset}
                style={styles.button}
              />
            </View>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.background.secondary,
    padding: spacing.xl,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: "center",
  },
  title: {
    color: colors.priority.critical,
    marginBottom: spacing.md,
  },
  description: {
    marginBottom: spacing.xl,
  },
  errorBox: {
    width: "100%",
    maxHeight: 120,
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  errorText: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  button: {
    width: "100%",
  },
});
