import { UserRole } from "@lastminute/types";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: UserRole;
      };
      correlationId?: string;
    }
  }
}
