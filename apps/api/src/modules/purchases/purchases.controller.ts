import type { FastifyReply, FastifyRequest } from 'fastify';

import { NotFoundError } from '../../shared/errors/app-error';
import { purchasesMapper } from './purchases.mapper';
import {
  createPurchaseSchema,
  purchaseIdParamsSchema,
  updatePurchaseSchema,
} from './purchases.schema';
import { purchasesService } from './purchases.service';

export const purchasesController = {
  getAll(_request: FastifyRequest, reply: FastifyReply) {
    const purchases = purchasesService.getAll();

    return reply.send(purchasesMapper.toResponseList(purchases));
  },

  getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = purchaseIdParamsSchema.parse(request.params);

    const purchase = purchasesService.getById(id);

    if (!purchase) {
      throw new NotFoundError('Purchase not found');
    }

    return reply.send(purchasesMapper.toResponse(purchase));
  },

  create(request: FastifyRequest, reply: FastifyReply) {
    const body = createPurchaseSchema.parse(request.body);

    const purchase = purchasesService.create(body);

    return reply.status(201).send(purchasesMapper.toResponse(purchase));
  },

  update(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = purchaseIdParamsSchema.parse(request.params);
    const body = updatePurchaseSchema.parse(request.body);

    const purchase = purchasesService.update(id, body);

    if (!purchase) {
      throw new NotFoundError('Purchase not found');
    }

    return reply.send(purchasesMapper.toResponse(purchase));
  },
  
  getSummary(_request: FastifyRequest, reply: FastifyReply) {
    const summary = purchasesService.getSummary();

    return reply.send(summary);
  },
};