import type { FastifyReply, FastifyRequest } from "fastify";

import { NotFoundError } from "../../shared/errors/app-error";
import { categoriesMapper } from "./categories.mapper";
import {
  categoryIdParamsSchema,
  createCategorySchema,
  updateCategorySchema,
} from "./categories.schema";
import { categoriesService } from "./categories.service";

export const categoriesController = {
  async getAll(
    request: FastifyRequest<{
      Querystring: { includeInactive?: string };
    }>,
    reply: FastifyReply,
  ) {
    const includeInactive = request.query.includeInactive === "true";

    const categories = await categoriesService.getAll(includeInactive);

    return reply.send(categoriesMapper.toResponseList(categories));
  },

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = categoryIdParamsSchema.parse(request.params);

    const category = await categoriesService.getById(id);

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    return reply.send(categoriesMapper.toResponse(category));
  },

  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = createCategorySchema.parse(request.body);

    const category = await categoriesService.create(body);

    return reply.status(201).send(categoriesMapper.toResponse(category));
  },

  async update(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = categoryIdParamsSchema.parse(request.params);
    const body = updateCategorySchema.parse(request.body);

    const category = await categoriesService.update(id, body);

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    return reply.send(categoriesMapper.toResponse(category));
  },

  async deactivate(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = categoryIdParamsSchema.parse(request.params);

    const category = await categoriesService.deactivate(id);

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    return reply.send(categoriesMapper.toResponse(category));
  },

  async reactivate(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = categoryIdParamsSchema.parse(request.params);

    const category = await categoriesService.reactivate(id);

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    return reply.send(categoriesMapper.toResponse(category));
  },
};