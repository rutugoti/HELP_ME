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

export type DashboardStackParamList = {
  Dashboard: undefined;
  PriorityList: undefined;
  DailyBrief: undefined;
};

export type TasksStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: string };
  TaskCreate: undefined;
  TaskEdit: { taskId: string };
};

export type AppTabParamList = {
  DashboardTab: NavigatorScreenParams<DashboardStackParamList>;
  TasksTab: NavigatorScreenParams<TasksStackParamList>;
  GoalsTab: undefined;
  SettingsTab: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  App: NavigatorScreenParams<AppTabParamList>;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
