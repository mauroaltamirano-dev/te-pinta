import type { FastifyReply, FastifyRequest } from "fastify";

import { productsMapper } from "./products.mapper";
import {
  createProductSchema,
  productIdParamsSchema,
  updateProductSchema,
} from "./products.schema";
import { productsService } from "./products.service";

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

export const productsController = {
  async getAll(_request: FastifyRequest, reply: FastifyReply) {
    const items = await productsService.getAll();

    return reply.send(
      items.map((item) =>
        productsMapper.toResponse(item.product, item.categoryName),
      ),
    );
  },

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const paramsResult = productIdParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: "Invalid route params",
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const item = await productsService.getById(paramsResult.data.id);

    if (!item) {
      return reply.status(404).send({
        message: "Product not found",
      });
    }

    return reply.send(
      productsMapper.toResponse(item.product, item.categoryName),
    );
  },

  async create(request: FastifyRequest, reply: FastifyReply) {
    const bodyResult = createProductSchema.safeParse(request.body);

    if (!bodyResult.success) {
      return reply.status(400).send({
        message: "Invalid request body",
        issues: formatZodIssues(bodyResult.error.issues),
      });
    }

    try {
      const item = await productsService.create(bodyResult.data);

      return reply
        .status(201)
        .send(productsMapper.toResponse(item.product, item.categoryName));
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
    const paramsResult = productIdParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: "Invalid route params",
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const bodyResult = updateProductSchema.safeParse(request.body);

    if (!bodyResult.success) {
      return reply.status(400).send({
        message: "Invalid request body",
        issues: formatZodIssues(bodyResult.error.issues),
      });
    }

    try {
      const item = await productsService.update(
        paramsResult.data.id,
        bodyResult.data,
      );

      if (!item) {
        return reply.status(404).send({
          message: "Product not found",
        });
      }

      return reply.send(
        productsMapper.toResponse(item.product, item.categoryName),
      );
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
    const paramsResult = productIdParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: "Invalid route params",
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const item = await productsService.deactivate(paramsResult.data.id);

    if (!item) {
      return reply.status(404).send({
        message: "Product not found",
      });
    }

    return reply.send(
      productsMapper.toResponse(item.product, item.categoryName),
    );
  },

  async reactivate(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const paramsResult = productIdParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: "Invalid route params",
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const item = await productsService.reactivate(paramsResult.data.id);

    if (!item) {
      return reply.status(404).send({
        message: "Product not found",
      });
    }

    return reply.send(
      productsMapper.toResponse(item.product, item.categoryName),
    );
  },
};