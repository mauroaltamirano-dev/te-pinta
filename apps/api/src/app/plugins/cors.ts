import cors from "@fastify/cors";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

import { env } from "../../config/env";

export const registerCors: FastifyPluginAsync = fp(async (app) => {
  await app.register(cors, {
    origin: env.webOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
});