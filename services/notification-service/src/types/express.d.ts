// ─────────────────────────────────────────────────────────────
// LastMinute — Express Request Type Declarations
// Binds authorization payload and correlation keys.
// ─────────────────────────────────────────────────────────────

import "@types/express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
      correlationId?: string;
    }
  }
}
