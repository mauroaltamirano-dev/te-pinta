import type { FastifyReply, FastifyRequest } from "fastify";

import { categoriesMapper } from "./categories.mapper";
import {
  categoryIdParamsSchema,
  createCategorySchema,
  updateCategorySchema,
} from "./categories.schema";
import { categoriesService } from "./categories.service";

function formatZodIssues(issues: Array<{ path: PropertyKey[]; message: string }>) {
  return issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

function isServiceError(
  error: unknown,
): error is { statusCode: number; message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    "message" in error
  );
}

export const categoriesController = {
  async getAll(_request: FastifyRequest, reply: FastifyReply) {
    const categories = await categoriesService.getAll();

    return reply.send(categoriesMapper.toResponseList(categories));
  },

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const paramsResult = categoryIdParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: "Invalid route params",
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const category = await categoriesService.getById(paramsResult.data.id);

    if (!category) {
      return reply.status(404).send({
        message: "Category not found",
      });
    }

    return reply.send(categoriesMapper.toResponse(category));
  },

  async create(request: FastifyRequest, reply: FastifyReply) {
    const bodyResult = createCategorySchema.safeParse(request.body);

    if (!bodyResult.success) {
      return reply.status(400).send({
        message: "Invalid request body",
        issues: formatZodIssues(bodyResult.error.issues),
      });
    }

    try {
      const category = await categoriesService.create(bodyResult.data);

      return reply.status(201).send(categoriesMapper.toResponse(category));
    } catch (error) {
      if (isServiceError(error)) {
        return reply.status(error.statusCode).send({
          message: error.message,
        });
      }

      return reply.status(500).send({
        message: "Unexpected error",
      });
    }
  },

  async update(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const paramsResult = categoryIdParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: "Invalid route params",
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const bodyResult = updateCategorySchema.safeParse(request.body);

    if (!bodyResult.success) {
      return reply.status(400).send({
        message: "Invalid request body",
        issues: formatZodIssues(bodyResult.error.issues),
      });
    }

    try {
      const category = await categoriesService.update(
        paramsResult.data.id,
        bodyResult.data,
      );

      if (!category) {
        return reply.status(404).send({
          message: "Category not found",
        });
      }

      return reply.send(categoriesMapper.toResponse(category));
    } catch (error) {
      if (isServiceError(error)) {
        return reply.status(error.statusCode).send({
          message: error.message,
        });
      }

      return reply.status(500).send({
        message: "Unexpected error",
      });
    }
  },

  async deactivate(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const paramsResult = categoryIdParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: "Invalid route params",
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const category = await categoriesService.deactivate(paramsResult.data.id);

    if (!category) {
      return reply.status(404).send({
        message: "Category not found",
      });
    }

    return reply.send(categoriesMapper.toResponse(category));
  },
};