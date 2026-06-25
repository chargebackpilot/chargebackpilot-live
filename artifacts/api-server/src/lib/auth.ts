import { type Request, type Response, type NextFunction } from "express";
import { timingSafeEqual, randomBytes } from "node:crypto";
import { logger } from "./logger";

/**
 * Session store - in production, use Redis or similar
 * For now, in-memory with timeout
 */
class SessionStore {
  private sessions = new Map<string, { expiresAt: number }>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup expired sessions every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        const now = Date.now();
        for (const [key, value] of this.sessions.entries()) {
          if (value.expiresAt < now) {
            this.sessions.delete(key);
          }
        }
        logger.debug(`Cleaned up expired sessions. Remaining: ${this.sessions.size}`);
      },
      5 * 60 * 1000
    );
  }

  create(): string {
    const token = randomBytes(32).toString("hex");
    this.sessions.set(token, {
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });
    return token;
  }

  verify(token: string): boolean {
    const session = this.sessions.get(token);
    if (!session) {
      return false;
    }
    if (session.expiresAt < Date.now()) {
      this.sessions.delete(token);
      return false;
    }
    return true;
  }

  destroy(token: string): void {
    this.sessions.delete(token);
  }

  cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

export const sessionStore = new SessionStore();

/**
 * Secure password comparison to prevent timing attacks
 */
export function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) {
    // Still call timingSafeEqual on same-length buffer to keep timing stable
    timingSafeEqual(aBuf, aBuf);
    return false;
  }
  return timingSafeEqual(aBuf, bBuf);
}

/**
 * Validate admin session token from Authorization header
 */
export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    logger.warn("Admin request without Bearer token");
    res.status(401).json({
      code: "UNAUTHORIZED",
      message: "Missing or invalid authorization header",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix
  if (!sessionStore.verify(token)) {
    logger.warn("Invalid or expired admin session");
    res.status(401).json({
      code: "UNAUTHORIZED",
      message: "Invalid or expired session",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  next();
}
