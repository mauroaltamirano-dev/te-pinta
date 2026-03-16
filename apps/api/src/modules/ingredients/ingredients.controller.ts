import type { FastifyReply, FastifyRequest } from "fastify";

import { ingredientsMapper } from "./ingredients.mapper";
import {
  ingredientIdParamsSchema,
  createIngredientSchema,
  updateIngredientSchema,
} from "./ingredients.schema";
import { ingredientsService } from "./ingredients.service";

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

export const ingredientsController = {
  async getAll(_request: FastifyRequest, reply: FastifyReply) {
    const ingredients = await ingredientsService.getAll();

    return reply.send(ingredientsMapper.toResponseList(ingredients));
  },

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const paramsResult = ingredientIdParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: "Invalid route params",
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const ingredient = await ingredientsService.getById(paramsResult.data.id);

    if (!ingredient) {
      return reply.status(404).send({
        message: "Ingredient not found",
      });
    }

    return reply.send(ingredientsMapper.toResponse(ingredient));
  },

  async create(request: FastifyRequest, reply: FastifyReply) {
    const bodyResult = createIngredientSchema.safeParse(request.body);

    if (!bodyResult.success) {
      return reply.status(400).send({
        message: "Invalid request body",
        issues: formatZodIssues(bodyResult.error.issues),
      });
    }

    try {
      const ingredient = await ingredientsService.create(bodyResult.data);

      return reply.status(201).send(ingredientsMapper.toResponse(ingredient));
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
    const paramsResult = ingredientIdParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: "Invalid route params",
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const bodyResult = updateIngredientSchema.safeParse(request.body);

    if (!bodyResult.success) {
      return reply.status(400).send({
        message: "Invalid request body",
        issues: formatZodIssues(bodyResult.error.issues),
      });
    }

    try {
      const ingredient = await ingredientsService.update(
        paramsResult.data.id,
        bodyResult.data,
      );

      if (!ingredient) {
        return reply.status(404).send({
          message: "Ingredient not found",
        });
      }

      return reply.send(ingredientsMapper.toResponse(ingredient));
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
    const paramsResult = ingredientIdParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: "Invalid route params",
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const ingredient = await ingredientsService.deactivate(paramsResult.data.id);

    if (!ingredient) {
      return reply.status(404).send({
        message: "Ingredient not found",
      });
    }

    return reply.send(ingredientsMapper.toResponse(ingredient));
  },
};