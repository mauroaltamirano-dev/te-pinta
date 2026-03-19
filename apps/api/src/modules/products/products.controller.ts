import type { FastifyReply, FastifyRequest } from "fastify";

import { NotFoundError } from "../../shared/errors/app-error";
import { productsMapper } from "./products.mapper";
import {
  createProductSchema,
  productIdParamsSchema,
  updateProductSchema,
} from "./products.schema";
import { productsService } from "./products.service";

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
    const { id } = productIdParamsSchema.parse(request.params);

    const item = await productsService.getById(id);

    if (!item) {
      throw new NotFoundError("Product not found");
    }

    return reply.send(
      productsMapper.toResponse(item.product, item.categoryName),
    );
  },

  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = createProductSchema.parse(request.body);

    const item = await productsService.create(body);

    return reply
      .status(201)
      .send(productsMapper.toResponse(item.product, item.categoryName));
  },

  async update(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = productIdParamsSchema.parse(request.params);
    const body = updateProductSchema.parse(request.body);

    const item = await productsService.update(
      id,
      body,
    );

    if (!item) {
      throw new NotFoundError("Product not found");
    }

    return reply.send(
      productsMapper.toResponse(item.product, item.categoryName),
    );
  },

  async deactivate(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = productIdParamsSchema.parse(request.params);

    const item = await productsService.deactivate(id);

    if (!item) {
      throw new NotFoundError("Product not found");
    }

    return reply.send(
      productsMapper.toResponse(item.product, item.categoryName),
    );
  },

  async reactivate(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = productIdParamsSchema.parse(request.params);

    const item = await productsService.reactivate(id);

    if (!item) {
      throw new NotFoundError("Product not found");
    }

    return reply.send(
      productsMapper.toResponse(item.product, item.categoryName),
    );
  },
};