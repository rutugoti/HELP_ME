// ─────────────────────────────────────────────────────────────
// LastMinute — Authentication Service
// Implements registration, login, refresh, logout, and password reset.
// ─────────────────────────────────────────────────────────────

import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import { db } from "@lastminute/database";
import type { AuthTokens, CreateUserInput, UserRole, NotificationChannel } from "@lastminute/types";
import { config } from "../config/index.js";
import { logger } from "../config/logger.js";
import type {
  IRefreshTokenRepository,
  IUserPreferencesRepository,
  IUserRepository,
} from "../repositories/interfaces.js";
import { comparePassword, hashPassword, sha256 } from "../utils/crypto.js";
import { ConflictError, UnauthenticatedError } from "../utils/errors.js";
import type { AccessTokenPayload, RefreshTokenPayload } from "../models/auth.js";
import type { IAuthService } from "./interfaces.js";

export class AuthService implements IAuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userPreferencesRepository: IUserPreferencesRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository
  ) {}

  private generateAccessToken(userId: string, email: string, role: UserRole): string {
    const payload: AccessTokenPayload = { userId, email, role };
    return jwt.sign(payload as object, config.jwt.secret, {
      expiresIn: config.jwt.accessExpiry as unknown as number,
    });
  }

  private generateRefreshToken(userId: string): { token: string; id: string; expiresAt: Date } {
    const tokenId = randomUUID();
    const payload: RefreshTokenPayload = { tokenId, userId };

    // Generate the raw JWT refresh token
    const token = jwt.sign(payload as object, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiry as unknown as number,
    });

    // Calculate expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    return { token, id: tokenId, expiresAt };
  }

  async register(input: CreateUserInput): Promise<AuthTokens> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("An account with this email address already exists.");
    }

    const userId = randomUUID();
    const hashedPassword = await hashPassword(input.password);

    // Coordinate User + Default Preferences creation inside a transaction
    const tokens = await db.transaction(async (trx) => {
      // 1. Create User
      const user = await this.userRepository.create(
        {
          id: userId,
          email: input.email.toLowerCase(),
          passwordHash: hashedPassword,
          fullName: input.fullName,
          role: input.role,
          timezone: input.timezone,
          isVerified: false,
          isActive: true,
          lastLoginAt: null,
        },
        trx
      );

      // 2. Create User Preferences
      const defaultPrefs = {
        id: randomUUID(),
        userId: user.id,
        notificationLowChannels: ["in-app"] as NotificationChannel[],
        notificationMediumChannels: ["push"] as NotificationChannel[],
        notificationHighChannels: ["push", "email"] as NotificationChannel[],
        notificationCriticalChannels: ["push", "email", "sms"] as NotificationChannel[],
        workingHoursStart: "09:00",
        workingHoursEnd: "18:00",
        workingDays: [1, 2, 3, 4, 5],
        voiceEnabled: false,
        autonomousSchedulingEnabled: false,
        contentPrivacyMode: false,
        escalationContactEmail: null,
        escalationContactName: null,
        escalationThreshold: null,
      };

      await this.userPreferencesRepository.create(defaultPrefs, trx);

      // 3. Generate initial session tokens
      const accessToken = this.generateAccessToken(user.id, user.email, user.role);
      const { token: refreshToken, id: tokenId, expiresAt } = this.generateRefreshToken(user.id);

      // Store refresh token hash
      await this.refreshTokenRepository.create(
        {
          id: tokenId,
          userId: user.id,
          tokenHash: sha256(refreshToken),
          expiresAt: expiresAt.toISOString(),
          ipAddress: null,
          userAgent: null,
        },
        trx
      );

      return {
        accessToken,
        refreshToken,
        userId: user.id,
        onboardingRequired: true,
      };
    });

    logger.info("New user registered successfully", { userId, role: input.role });
    return tokens;
  }

  async login(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthTokens> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.isActive) {
      throw new UnauthenticatedError("Invalid email or password.");
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthenticatedError("Invalid email or password.");
    }

    const accessToken = this.generateAccessToken(user.id, user.email, user.role);
    const { token: refreshToken, id: tokenId, expiresAt } = this.generateRefreshToken(user.id);

    await db.transaction(async (trx) => {
      // Invalidate all previous sessions for this user (Single Session constraint per API.md)
      await this.refreshTokenRepository.revokeAllForUser(user.id, trx);

      // Save new refresh token
      await this.refreshTokenRepository.create(
        {
          id: tokenId,
          userId: user.id,
          tokenHash: sha256(refreshToken),
          expiresAt: expiresAt.toISOString(),
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
        },
        trx
      );

      // Update last login timestamp
      await this.userRepository.updateLastLogin(user.id, trx);
    });

    logger.info("User logged in successfully", { userId: user.id });

    return {
      accessToken,
      refreshToken,
      userId: user.id,
      onboardingRequired: false,
    };
  }

  async refresh(refreshToken: string, ipAddress?: string, userAgent?: string): Promise<AuthTokens> {
    let payload: RefreshTokenPayload;
    try {
      payload = jwt.verify(refreshToken, config.jwt.refreshSecret) as RefreshTokenPayload;
    } catch {
      throw new UnauthenticatedError("Invalid refresh token.");
    }

    const tokenHash = sha256(refreshToken);
    const storedToken = await this.refreshTokenRepository.findByHash(tokenHash);

    if (!storedToken || storedToken.userId !== payload.userId) {
      throw new UnauthenticatedError("Invalid refresh token.");
    }

    if (new Date(storedToken.expiresAt) < new Date() || storedToken.revokedAt) {
      throw new UnauthenticatedError("Refresh token has expired or has been revoked.");
    }

    const user = await this.userRepository.findById(payload.userId);
    if (!user || !user.isActive) {
      throw new UnauthenticatedError("User account is inactive or not found.");
    }

    // Standard rolling tokens strategy
    const accessToken = this.generateAccessToken(user.id, user.email, user.role);
    const {
      token: newRefreshToken,
      id: newMinTokenId,
      expiresAt: newExpiresAt,
    } = this.generateRefreshToken(user.id);

    await db.transaction(async (trx) => {
      // Revoke the old refresh token
      await this.refreshTokenRepository.revoke(storedToken.id, trx);

      // Save the new refresh token
      await this.refreshTokenRepository.create(
        {
          id: newMinTokenId,
          userId: user.id,
          tokenHash: sha256(newRefreshToken),
          expiresAt: newExpiresAt.toISOString(),
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
        },
        trx
      );
    });

    logger.debug("Tokens refreshed successfully", { userId: user.id });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      userId: user.id,
      onboardingRequired: false,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    let payload: RefreshTokenPayload;
    try {
      payload = jwt.verify(refreshToken, config.jwt.refreshSecret) as RefreshTokenPayload;
    } catch {
      // If verification fails but token is passed, we can just hash and attempt to revoke it anyway.
      const tokenHash = sha256(refreshToken);
      const storedToken = await this.refreshTokenRepository.findByHash(tokenHash);
      if (storedToken) {
        await this.refreshTokenRepository.revoke(storedToken.id);
      }
      return;
    }

    const tokenHash = sha256(refreshToken);
    const storedToken = await this.refreshTokenRepository.findByHash(tokenHash);

    if (storedToken && storedToken.userId === payload.userId) {
      await this.refreshTokenRepository.revoke(storedToken.id);
      logger.info("User logged out successfully", { userId: payload.userId });
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Always return 200/success (resolved in controller) to prevent email verification probing
      logger.warn("Password reset requested for non-existent email", { email });
      return;
    }

    // Generate a one-time short-lived token using JWT, using user's passwordHash as part of secret
    // to invalidate the token once the password changes!
    const secret = config.jwt.secret + user.passwordHash;
    const resetToken = jwt.sign({ userId: user.id }, secret, { expiresIn: "15m" });

    // Print to logs as per spec (in production this would fire an email event)
    logger.info("PASSWORD RESET LINK GENERATED", {
      userId: user.id,
      email: user.email,
      link: `/api/v1/auth/password/reset?token=${resetToken}`,
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // We must decode first to find the user so we can retrieve their password hash
    const decoded = jwt.decode(token) as { userId?: string };
    if (!decoded || !decoded.userId) {
      throw new UnauthenticatedError("Invalid reset token.");
    }

    const user = await this.userRepository.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new UnauthenticatedError("Invalid reset token.");
    }

    // Verify token using the user-specific secret
    const secret = config.jwt.secret + user.passwordHash;
    try {
      jwt.verify(token, secret);
    } catch {
      throw new UnauthenticatedError("Reset token has expired or is invalid.");
    }

    const newHashedPassword = await hashPassword(newPassword);

    await db.transaction(async (trx) => {
      // Update password hash
      await this.userRepository.update(user.id, { passwordHash: newHashedPassword }, trx);

      // Invalidate all active sessions on password change
      await this.refreshTokenRepository.revokeAllForUser(user.id, trx);
    });

    logger.info("Password reset successfully", { userId: user.id });
  }
}
