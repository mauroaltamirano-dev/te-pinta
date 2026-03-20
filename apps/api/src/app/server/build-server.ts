import Fastify from "fastify";

import { buildLoggerOptions } from "../../config/logger.config";
import { registerAppRoutes } from "../routes";
import { registerCors } from "../plugins/cors";
import { requestLoggingPlugin } from "../plugins/request-logging.plugin";
import { errorHandlerPlugin } from "../plugins/error-handler.plugin";

export function buildServer() {
  const app = Fastify({
    logger: buildLoggerOptions(),
    disableRequestLogging: true,
  });

  console.log(app)

  app.register(requestLoggingPlugin);
  app.register(errorHandlerPlugin);
  app.register(registerCors);
  app.register(registerAppRoutes);

  return app;
}