// ─────────────────────────────────────────────────────────────
// LastMinute — Authentication Controller
// Handles login, registration, refresh, logout, and password reset.
// ─────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from "express";
import type { IAuthService } from "../services/interfaces.js";

export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json({
        status: "success",
        data: result,
        meta: {
          correlationId: req.correlationId,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.header("user-agent");

      const result = await this.authService.login(email, password, ipAddress, userAgent);

      res.status(200).json({
        status: "success",
        data: result,
        meta: {
          correlationId: req.correlationId,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.header("user-agent");

      const result = await this.authService.refresh(refreshToken, ipAddress, userAgent);

      res.status(200).json({
        status: "success",
        data: result,
        meta: {
          correlationId: req.correlationId,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      await this.authService.logout(refreshToken);

      res.status(200).json({
        status: "success",
        data: {
          message: "Logout successful.",
        },
        meta: {
          correlationId: req.correlationId,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  requestPasswordReset = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      await this.authService.requestPasswordReset(email);

      // Always return 200 regardless of whether email exists to prevent enumeration
      res.status(200).json({
        status: "success",
        data: {
          message: "If the account exists, a password reset link has been generated and logged.",
        },
        meta: {
          correlationId: req.correlationId,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, newPassword } = req.body;
      await this.authService.resetPassword(token, newPassword);

      res.status(200).json({
        status: "success",
        data: {
          message: "Password has been successfully updated.",
        },
        meta: {
          correlationId: req.correlationId,
        },
      });
    } catch (err) {
      next(err);
    }
  };
}
