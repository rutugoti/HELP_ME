// ─────────────────────────────────────────────────────────────
// LastMinute — Express Request Type Declarations
// Binds authorization payload and correlation keys for the API Gateway.
// ─────────────────────────────────────────────────────────────

import "@types/express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role?: string;
      };
      correlationId?: string;
    }
  }
}
