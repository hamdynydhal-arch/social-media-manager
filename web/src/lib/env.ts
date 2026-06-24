/**
 * Strict environment variable validation.
 * The Next.js BFF must fail-fast at startup if security-critical vars are absent in production.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(
      `[Spear5 BFF] Missing required environment variable: ${key}. ` +
      `Refusing to start in production without it.`
    );
  }
  return value ?? "";
}

export const env = {
  /** Comma-separated list of whitelisted emails allowed to authenticate. */
  ALLOWED_EMAILS: requireEnv("ALLOWED_EMAILS"),

  /** Base URL of the Python quantitative trading backend. */
  PYTHON_BACKEND_URL: requireEnv("PYTHON_BACKEND_URL"),

  /** Shared secret for signing internal BFF → backend API requests. */
  INTERNAL_API_SECRET: requireEnv("INTERNAL_API_SECRET"),

  /** Convenience flag. */
  IS_PRODUCTION: process.env.NODE_ENV === "production",
} as const;
