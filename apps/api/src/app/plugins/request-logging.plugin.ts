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
  });

  app.addHook("onResponse", async (request, reply) => {
    if (reply.statusCode < 400) return;

    const startedAt = request[REQUEST_START_TIME];
    const durationMs = startedAt ? Date.now() - startedAt : undefined;

    const level = reply.statusCode >= 500 ? "error" : "warn";

    request.log[level](
      {
        method: request.method,
        route: request.routeOptions?.url ?? request.url,
        statusCode: reply.statusCode,
        durationMs,
      },
      "request.failed",
    );
  });
});