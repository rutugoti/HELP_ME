// ─────────────────────────────────────────────────────────────
// LastMinute — Design System Colors
// Single source of truth. No hex values appear anywhere else.
// ─────────────────────────────────────────────────────────────

export const colors = {
  // ── Background layers (darkest → lightest) ──────────────────
  background: {
    primary: "#0F172A",
    secondary: "#1E293B",
    tertiary: "#334155",
    input: "#1A2332",
  },

  // ── Text hierarchy ──────────────────────────────────────────
  text: {
    primary: "#F8FAFC",
    secondary: "#94A3B8",
    tertiary: "#64748B",
    inverse: "#0F172A",
  },

  // ── Brand accent ────────────────────────────────────────────
  accent: {
    primary: "#6366F1",
    primaryHover: "#818CF8",
    primaryMuted: "#312E81",
    secondary: "#8B5CF6",
  },

  // ── Priority tier indicators ────────────────────────────────
  priority: {
    critical: "#EF4444",
    criticalBg: "#450A0A",
    high: "#F59E0B",
    highBg: "#451A03",
    medium: "#3B82F6",
    mediumBg: "#172554",
    low: "#6B7280",
    lowBg: "#1F2937",
  },

  // ── Semantic status ─────────────────────────────────────────
  status: {
    success: "#10B981",
    successBg: "#022C22",
    warning: "#F59E0B",
    warningBg: "#451A03",
    error: "#EF4444",
    errorBg: "#450A0A",
    info: "#3B82F6",
    infoBg: "#172554",
  },

  // ── Surface & border ────────────────────────────────────────
  border: {
    default: "#334155",
    subtle: "#1E293B",
    focus: "#6366F1",
  },

  // ── Overlays ────────────────────────────────────────────────
  overlay: {
    backdrop: "rgba(0, 0, 0, 0.6)",
    card: "rgba(30, 41, 59, 0.85)",
  },

  // ── Utility ─────────────────────────────────────────────────
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
} as const;

export type ColorToken = typeof colors;
