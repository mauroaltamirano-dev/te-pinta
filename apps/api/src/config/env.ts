import { z } from "zod";

const envSchema = z.object({
  PORT: z
    .string()
    .default("3001")
    .transform((v) => Number(v)),
  API_PREFIX: z.string().default("/api/v1"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  WEB_ORIGINS: z
    .string()
    .default("http://localhost:5173,http://127.0.0.1:5173"),
  LOG_LEVEL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.format());
  process.exit(1);
}

const data = parsed.data;

export const env = {
  port: data.PORT,
  apiPrefix: data.API_PREFIX,
  nodeEnv: data.NODE_ENV,
  isDevelopment: data.NODE_ENV === "development",
  isTest: data.NODE_ENV === "test",
  isProduction: data.NODE_ENV === "production",

  databaseUrl: data.DATABASE_URL,

  webOrigins: data.WEB_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),

  logLevel: data.LOG_LEVEL ?? (data.NODE_ENV === "development" ? "debug" : "info"),
} as const;