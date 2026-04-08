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
  async getAll(_request: FastifyRequest, reply: FastifyReply) {
    const purchases = await purchasesService.getAll();

    return reply.send(purchasesMapper.toResponseList(purchases));
  },

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = purchaseIdParamsSchema.parse(request.params);

    const purchase = await purchasesService.getById(id);

    if (!purchase) {
      throw new NotFoundError('Purchase not found');
    }

    return reply.send(purchasesMapper.toResponse(purchase));
  },

  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = createPurchaseSchema.parse(request.body);

    const purchase = await purchasesService.create(body);

    return reply.status(201).send(purchasesMapper.toResponse(purchase));
  },

  async update(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = purchaseIdParamsSchema.parse(request.params);
    const body = updatePurchaseSchema.parse(request.body);

    const purchase = await purchasesService.update(id, body);

    if (!purchase) {
      throw new NotFoundError('Purchase not found');
    }

    return reply.send(purchasesMapper.toResponse(purchase));
  },

  async remove(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = purchaseIdParamsSchema.parse(request.params);

    const ok = await purchasesService.remove(id);

    if (!ok) {
      throw new NotFoundError('Purchase not found');
    }

    return reply.status(204).send();
  },
  
  async getSummary(_request: FastifyRequest, reply: FastifyReply) {
    const summary = await purchasesService.getSummary();

    return reply.send(summary);
  },
};