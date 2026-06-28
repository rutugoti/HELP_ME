// ─────────────────────────────────────────────────────────────
// LastMinute — User Role Constants
// Display metadata for each UserRole enum value.
// ─────────────────────────────────────────────────────────────

import { UserRole } from "@lastminute/types";

export interface RoleMeta {
  readonly label: string;
  readonly description: string;
  readonly icon: string;
  readonly defaultConsequenceWeight: number;
}

/**
 * Role metadata keyed by UserRole enum values.
 * Used in onboarding role selection and profile display.
 * defaultConsequenceWeight seeds the behavioral model baseline.
 */
export const roles: Record<UserRole, RoleMeta> = {
  [UserRole.Executive]: {
    label: "Executive",
    description: "C-suite, managing directors, senior partners",
    icon: "briefcase-outline",
    defaultConsequenceWeight: 0.95,
  },
  [UserRole.Medical]: {
    label: "Medical Professional",
    description: "Doctors, surgeons, clinical practitioners",
    icon: "medkit-outline",
    defaultConsequenceWeight: 0.9,
  },
  [UserRole.Legal]: {
    label: "Legal Professional",
    description: "Lawyers, paralegals, compliance officers",
    icon: "shield-checkmark-outline",
    defaultConsequenceWeight: 0.9,
  },
  [UserRole.Developer]: {
    label: "Developer",
    description: "Engineers, architects, tech leads",
    icon: "code-slash-outline",
    defaultConsequenceWeight: 0.7,
  },
  [UserRole.Manager]: {
    label: "Manager",
    description: "Project managers, team leads, coordinators",
    icon: "people-outline",
    defaultConsequenceWeight: 0.75,
  },
  [UserRole.Student]: {
    label: "Student",
    description: "University, graduate, or professional students",
    icon: "school-outline",
    defaultConsequenceWeight: 0.5,
  },
  [UserRole.Professional]: {
    label: "Professional",
    description: "Independent consultants, freelancers",
    icon: "person-outline",
    defaultConsequenceWeight: 0.65,
  },
};

/** Ordered role keys for the onboarding picker. */
export const roleKeys = Object.values(UserRole);
