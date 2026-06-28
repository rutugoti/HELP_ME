import type { UserRole } from "@lastminute/types";

declare global {
  namespace Express {
    interface Request {
      correlationId: string;
      user?: {
        userId: string;
        email: string;
        role: UserRole;
      };
    }
  }
}
