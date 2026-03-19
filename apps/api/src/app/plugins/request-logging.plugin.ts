import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";

const REQUEST_START_TIME = Symbol("requestStartTime");

declare module "fastify" {
  interface FastifyRequest {
    [REQUEST_START_TIME]?: number;
  }
}

export const requestLoggingPlugin: FastifyPluginAsync = fp(async (app) => {
  app.addHook("onRequest", async (request) => {
    request[REQUEST_START_TIME] = Date.now();

    request.log.debug(
      {
        req: request,
      },
      "request.received",
    );
  });

  app.addHook("onResponse", async (request, reply) => {
    const startedAt = request[REQUEST_START_TIME];
    const durationMs = startedAt ? Date.now() - startedAt : undefined;

    const level =
      reply.statusCode >= 500
        ? "error"
        : reply.statusCode >= 400
          ? "warn"
          : "info";

    request.log[level](
      {
        req: request,
        res: reply,
        durationMs,
      },
      "request.completed",
    );
  });
});