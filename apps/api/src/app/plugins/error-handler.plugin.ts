import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import { ZodError } from "zod";

import { AppError } from "../../shared/errors/app-error";
import { formatZodIssues } from "../../shared/errors/zod-error";

export const errorHandlerPlugin: FastifyPluginAsync = fp(async (app) => {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      request.log.warn(
        {
          method: request.method,
          route: request.routeOptions?.url ?? request.url,
          issues: formatZodIssues(error.issues),
        },
        "request.validation_failed",
      );

      return reply.status(400).send({
        message: "Validation error",
        code: "BAD_REQUEST",
        issues: formatZodIssues(error.issues),
      });
    }

    if (error instanceof AppError) {
      const logPayload = {
        method: request.method,
        route: request.routeOptions?.url ?? request.url,
        errorCode: error.code,
        statusCode: error.statusCode,
        details: error.details,
      };

      if (error.statusCode >= 500) {
        request.log.error(logPayload, error.message);
      } else {
        request.log.warn(logPayload, error.message);
      }

      return reply.status(error.statusCode).send({
        message: error.message,
        code: error.code,
        ...(error.details !== undefined ? { details: error.details } : {}),
      });
    }

    request.log.error(
      {
        method: request.method,
        route: request.routeOptions?.url ?? request.url,
        err: error,
      },
      "request.unhandled_error",
    );

    return reply.status(500).send({
      message: "Unexpected error",
      code: "INTERNAL_ERROR",
    });
  });
});