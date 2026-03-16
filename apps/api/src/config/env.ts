export const env = {
  port: Number(process.env.PORT || 3001),
  apiPrefix: process.env.API_PREFIX || "/api/v1",
  nodeEnv: process.env.NODE_ENV || "development",
  isDevelopment: (process.env.NODE_ENV || "development") === "development",
  databaseUrl: process.env.DATABASE_URL || "",
} as const;

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is not defined");
}