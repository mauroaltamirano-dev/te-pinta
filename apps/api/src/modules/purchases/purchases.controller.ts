import type { FastifyReply, FastifyRequest } from 'fastify';

import { purchasesMapper } from './purchases.mapper';
import {
  createPurchaseSchema,
  purchaseIdParamsSchema,
  updatePurchaseSchema,
} from './purchases.schema';
import { purchasesService } from './purchases.service';

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

export const purchasesController = {
  getAll(_request: FastifyRequest, reply: FastifyReply) {
    const purchases = purchasesService.getAll();

    return reply.send(purchasesMapper.toResponseList(purchases));
  },

  getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const paramsResult = purchaseIdParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: 'Invalid route params',
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const purchase = purchasesService.getById(paramsResult.data.id);

    if (!purchase) {
      return reply.status(404).send({
        message: 'Purchase not found',
      });
    }

    return reply.send(purchasesMapper.toResponse(purchase));
  },

  create(request: FastifyRequest, reply: FastifyReply) {
    const bodyResult = createPurchaseSchema.safeParse(request.body);

    if (!bodyResult.success) {
      return reply.status(400).send({
        message: 'Invalid request body',
        issues: formatZodIssues(bodyResult.error.issues),
      });
    }

    try {
      const purchase = purchasesService.create(bodyResult.data);

      return reply.status(201).send(purchasesMapper.toResponse(purchase));
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
    const paramsResult = purchaseIdParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: 'Invalid route params',
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const bodyResult = updatePurchaseSchema.safeParse(request.body);

    if (!bodyResult.success) {
      return reply.status(400).send({
        message: 'Invalid request body',
        issues: formatZodIssues(bodyResult.error.issues),
      });
    }

    const purchase = purchasesService.update(paramsResult.data.id, bodyResult.data);

    if (!purchase) {
      return reply.status(404).send({
        message: 'Purchase not found',
      });
    }

    return reply.send(purchasesMapper.toResponse(purchase));
  },
  getSummary(_request: FastifyRequest, reply: FastifyReply) {
  const summary = purchasesService.getSummary();

  return reply.send(summary);
},
};