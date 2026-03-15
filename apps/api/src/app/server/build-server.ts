import Fastify from "fastify";
import cors from "@fastify/cors";

import { env } from "../../config/env";
import { registerAppRoutes } from "../routes";

export function buildServer() {
  const app = Fastify({
    logger: env.isDevelopment
      ? {
          level: "info",
          transport: {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "HH:MM:ss",
              ignore: "pid,hostname",
            },
          },
        }
      : {
          level: "info",
        },
  });

  app.register(cors, {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  });

  app.register(registerAppRoutes);

  return app;
}