import type { FastifyReply, FastifyRequest } from 'fastify';

import { clientsMapper } from './clients.mapper';
import {
  clientIdParamsSchema,
  createClientSchema,
  updateClientSchema,
} from './clients.schema';
import { clientsService } from './clients.service';

function formatZodIssues(issues: Array<{ path: PropertyKey[]; message: string }>) {
  return issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
}

export const clientsController = {
  getAll(_request: FastifyRequest, reply: FastifyReply) {
    const clients = clientsService.getAll();

    return reply.send(clientsMapper.toResponseList(clients));
  },

  getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const paramsResult = clientIdParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: 'Invalid route params',
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const client = clientsService.getById(paramsResult.data.id);

    if (!client) {
      return reply.status(404).send({
        message: 'Client not found',
      });
    }

    return reply.send(clientsMapper.toResponse(client));
  },

  create(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const bodyResult = createClientSchema.safeParse(request.body);

    if (!bodyResult.success) {
      return reply.status(400).send({
        message: 'Invalid request body',
        issues: formatZodIssues(bodyResult.error.issues),
      });
    }

    const client = clientsService.create(bodyResult.data);

    return reply.status(201).send(clientsMapper.toResponse(client));
  },

  update(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const paramsResult = clientIdParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: 'Invalid route params',
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const bodyResult = updateClientSchema.safeParse(request.body);

    if (!bodyResult.success) {
      return reply.status(400).send({
        message: 'Invalid request body',
        issues: formatZodIssues(bodyResult.error.issues),
      });
    }

    const client = clientsService.update(paramsResult.data.id, bodyResult.data);

    if (!client) {
      return reply.status(404).send({
        message: 'Client not found',
      });
    }

    return reply.send(clientsMapper.toResponse(client));
  },

  deactivate(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const paramsResult = clientIdParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: 'Invalid route params',
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const client = clientsService.deactivate(paramsResult.data.id);

    if (!client) {
      return reply.status(404).send({
        message: 'Client not found',
      });
    }

    return reply.send(clientsMapper.toResponse(client));
  },
};