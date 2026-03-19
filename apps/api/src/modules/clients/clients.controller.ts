import type { FastifyReply, FastifyRequest } from 'fastify';

import { clientsMapper } from './clients.mapper';
import {
  clientIdParamsSchema,
  createClientSchema,
  updateClientSchema,
} from './clients.schema';
import { clientsService } from './clients.service';

function formatZodIssues(issues: Array<{ path: PropertyKey[]; message: string }>) {
  return issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
}

function isServiceError(e: unknown): e is { statusCode: number; message: string } {
  return (
    typeof e === 'object' && e !== null && 'statusCode' in e && 'message' in e
  );
}

export const clientsController = {
  async getAll(
    request: FastifyRequest<{ Querystring: { includeInactive?: string } }>,
    reply: FastifyReply,
  ) {
    const includeInactive = request.query.includeInactive === 'true';
    const clients = await clientsService.getAll({ includeInactive });
    return reply.send(clientsMapper.toResponseList(clients));
  },

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const params = clientIdParamsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ message: 'Invalid params', issues: formatZodIssues(params.error.issues) });
    }
    const client = await clientsService.getById(params.data.id);
    if (!client) return reply.status(404).send({ message: 'Client not found' });
    return reply.send(clientsMapper.toResponse(client));
  },

  async getStats(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const params = clientIdParamsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ message: 'Invalid params', issues: formatZodIssues(params.error.issues) });
    }
    try {
      const result = await clientsService.getClientStats(params.data.id);
      return reply.send({
        client: clientsMapper.toResponse(result.client),
        stats:  result.stats,
        orders: result.orders,
      });
    } catch (error) {
      if (isServiceError(error)) {
        return reply.status(error.statusCode).send({ message: error.message });
      }
      console.error('[clients] getStats error:', error);
      return reply.status(500).send({ message: 'Unexpected error' });
    }
  },

  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = createClientSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ message: 'Invalid body', issues: formatZodIssues(body.error.issues) });
    }
    try {
      const client = await clientsService.create(body.data);
      return reply.status(201).send(clientsMapper.toResponse(client));
    } catch (error) {
      if (isServiceError(error)) {
        return reply.status(error.statusCode).send({ message: error.message });
      }
      console.error('[clients] create error:', error);
      return reply.status(500).send({ message: 'Unexpected error' });
    }
  },

  async update(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const params = clientIdParamsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ message: 'Invalid params', issues: formatZodIssues(params.error.issues) });
    }
    const body = updateClientSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ message: 'Invalid body', issues: formatZodIssues(body.error.issues) });
    }
    try {
      const client = await clientsService.update(params.data.id, body.data);
      if (!client) return reply.status(404).send({ message: 'Client not found' });
      return reply.send(clientsMapper.toResponse(client));
    } catch (error) {
      if (isServiceError(error)) {
        return reply.status(error.statusCode).send({ message: error.message });
      }
      console.error('[clients] update error:', error);
      return reply.status(500).send({ message: 'Unexpected error' });
    }
  },

  async deactivate(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const params = clientIdParamsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ message: 'Invalid params', issues: formatZodIssues(params.error.issues) });
    }
    const client = await clientsService.deactivate(params.data.id);
    if (!client) return reply.status(404).send({ message: 'Client not found' });
    return reply.send(clientsMapper.toResponse(client));
  },

  async reactivate(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const params = clientIdParamsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ message: 'Invalid params', issues: formatZodIssues(params.error.issues) });
    }
    const client = await clientsService.reactivate(params.data.id);
    if (!client) return reply.status(404).send({ message: 'Client not found' });
    return reply.send(clientsMapper.toResponse(client));
  },
};