// ─────────────────────────────────────────────────────────────
// LastMinute — Navigation Types
// ─────────────────────────────────────────────────────────────

import { NavigatorScreenParams } from "@react-navigation/native";
import { UserRole } from "@lastminute/types";

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  RoleSelect: undefined;
  Register: { role: UserRole };
  ForgotPassword: undefined;
};

export type OnboardingStackParamList = {
  OnboardingIntro: undefined;
  CalendarConnect: undefined;
  WorkingHours: undefined;
  NotificationPermission: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  App: undefined; // Will be NavigatorScreenParams<AppStackParamList> in Session 13
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
