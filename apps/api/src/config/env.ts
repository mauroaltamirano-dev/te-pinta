export const env = {
  port: Number(process.env.PORT || 3001),
  apiPrefix: process.env.API_PREFIX || "/api/v1",
  nodeEnv: process.env.NODE_ENV || "development",
  isDevelopment: (process.env.NODE_ENV || "development") === "development",
  isTest: (process.env.NODE_ENV || "development") === "test",
  isProduction: (process.env.NODE_ENV || "development") === "production",

  databaseUrl: process.env.DATABASE_URL || "",

  webOrigins: (process.env.WEB_ORIGINS ||
    "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),

  logLevel:
    process.env.LOG_LEVEL ||
    ((process.env.NODE_ENV || "development") === "development"
      ? "debug"
      : "info"),
} as const;

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is not defined");
}