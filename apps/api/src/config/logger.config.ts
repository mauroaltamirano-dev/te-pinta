import type { FastifyServerOptions } from "fastify";

import { env } from "./env";

export function buildLoggerOptions(): FastifyServerOptions["logger"] {
  return {
    level: env.logLevel,
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "req.headers['x-api-key']",
      ],
      censor: "[REDACTED]",
    },
    transport: env.isDevelopment
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
            singleLine: false,
          },
        }
      : undefined,
    serializers: {
      req(request) {
        return {
          id: request.id,
          method: request.method,
          url: request.url,
          route: request.routeOptions?.url,
          params: request.params,
          query: request.query,
        };
      },
      res(reply) {
        return {
          statusCode: reply.statusCode,
        };
      },
      err(error) {
        return {
          type: error.name,
          message: error.message,
          ...(env.isDevelopment && { stack: error.stack }),
        } as any;
      },
    },
  };
}