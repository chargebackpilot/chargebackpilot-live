import { z } from "zod";

/**
 * Environment variables schema for the entire workspace
 * This ensures type-safe access to environment variables and validates them on startup
 */

const commonEnv = {
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
};

/**
 * API Server environment variables
 */
export const apiServerEnvSchema = z.object({
  ...commonEnv,
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL URL"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_API_KEY_FALLBACK: z.string().optional(),
  ADMIN_PASSWORD: z.string().min(16, "ADMIN_PASSWORD must be at least 16 characters"),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_", "Invalid Stripe secret key"),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  TURNSTILE_AFTER_ATTEMPTS: z.coerce.number().int().min(1).default(2),
  CASE_CREATE_WINDOW_MS: z.coerce.number().int().positive().default(3600000), // 1 hour
  CASE_CREATE_LIMIT_PER_WINDOW: z.coerce.number().int().positive().default(10),
  REQUIRE_TURNSTILE_ON_CASE_CREATE: z.enum(["0", "1"]).default("1"),
  BASE_PATH: z.string().default("/"),
});

export type ApiServerEnv = z.infer<typeof apiServerEnvSchema>;

/**
 * Frontend environment variables
 */
export const frontendEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  BASE_PATH: z.string().default("/"),
  VITE_API_BASE_URL: z.string().url().default("/api"),
  VITE_TURNSTILE_SITE_KEY: z.string().optional(),
});

export type FrontendEnv = z.infer<typeof frontendEnvSchema>;

/**
 * Parse and validate environment variables with error handling
 */
export function parseEnv<T extends z.ZodSchema>(
  schema: T,
  env: Record<string, string | undefined> = process.env
): z.infer<T> {
  const result = schema.safeParse(env);

  if (!result.success) {
    const errors = result.error.errors
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${errors}`);
  }

  return result.data;
}

/**
 * Get validated API server environment variables
 */
export function getApiServerEnv(): ApiServerEnv {
  return parseEnv(apiServerEnvSchema);
}

/**
 * Get validated frontend environment variables
 */
export function getFrontendEnv(): FrontendEnv {
  return parseEnv(frontendEnvSchema);
}
