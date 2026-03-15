import type { FastifyReply, FastifyRequest } from 'fastify';

import { productsMapper } from './products.mapper';
import {
  productIdParamsSchema,
  createProductSchema,
  updateProductSchema,
} from './products.schema';
import { productsService } from './products.service';

function formatZodIssues(issues: Array<{ path: PropertyKey[]; message: string }>) {
  return issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
}

function isServiceError(
  error: unknown,
): error is { statusCode: number; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    'message' in error
  );
}

export const productsController = {
  getAll(_request: FastifyRequest, reply: FastifyReply) {
    const products = productsService.getAll();

    return reply.send(productsMapper.toResponseList(products));
  },

  getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const paramsResult = productIdParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: 'Invalid route params',
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const product = productsService.getById(paramsResult.data.id);

    if (!product) {
      return reply.status(404).send({
        message: 'Product not found',
      });
    }

    return reply.send(productsMapper.toResponse(product));
  },

  create(request: FastifyRequest, reply: FastifyReply) {
    const bodyResult = createProductSchema.safeParse(request.body);

    if (!bodyResult.success) {
      return reply.status(400).send({
        message: 'Invalid request body',
        issues: formatZodIssues(bodyResult.error.issues),
      });
    }

    try {
      const product = productsService.create(bodyResult.data);

      return reply.status(201).send(productsMapper.toResponse(product));
    } catch (error) {
      if (isServiceError(error)) {
        return reply.status(error.statusCode).send({
          message: error.message,
        });
      }

      return reply.status(500).send({
        message: 'Unexpected error',
      });
    }
  },

  update(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const paramsResult = productIdParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: 'Invalid route params',
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const bodyResult = updateProductSchema.safeParse(request.body);

    if (!bodyResult.success) {
      return reply.status(400).send({
        message: 'Invalid request body',
        issues: formatZodIssues(bodyResult.error.issues),
      });
    }

    try {
      const product = productsService.update(
        paramsResult.data.id,
        bodyResult.data,
      );

      if (!product) {
        return reply.status(404).send({
          message: 'Product not found',
        });
      }

      return reply.send(productsMapper.toResponse(product));
    } catch (error) {
      if (isServiceError(error)) {
        return reply.status(error.statusCode).send({
          message: error.message,
        });
      }

      return reply.status(500).send({
        message: 'Unexpected error',
      });
    }
  },

  deactivate(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const paramsResult = productIdParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: 'Invalid route params',
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const product = productsService.deactivate(paramsResult.data.id);

    if (!product) {
      return reply.status(404).send({
        message: 'Product not found',
      });
    }

    return reply.send(productsMapper.toResponse(product));
  },

  reactivate(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const paramsResult = productIdParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: 'Invalid route params',
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const product = productsService.reactivate(paramsResult.data.id);

    if (!product) {
      return reply.status(404).send({
        message: 'Product not found',
      });
    }

    return reply.send(productsMapper.toResponse(product));
  },
};