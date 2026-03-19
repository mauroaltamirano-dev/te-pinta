import type { FastifyReply, FastifyRequest } from "fastify";

import { NotFoundError } from "../../shared/errors/app-error";
import { ingredientsMapper } from "./ingredients.mapper";
import {
  ingredientIdParamsSchema,
  createIngredientSchema,
  updateIngredientSchema,
} from "./ingredients.schema";
import { ingredientsService } from "./ingredients.service";

export const ingredientsController = {
  async getAll(_request: FastifyRequest, reply: FastifyReply) {
    const ingredients = await ingredientsService.getAll();

    return reply.send(ingredientsMapper.toResponseList(ingredients));
  },

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = ingredientIdParamsSchema.parse(request.params);

    const ingredient = await ingredientsService.getById(id);

    if (!ingredient) {
      throw new NotFoundError("Ingredient not found");
    }

    return reply.send(ingredientsMapper.toResponse(ingredient));
  },

  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = createIngredientSchema.parse(request.body);

    const ingredient = await ingredientsService.create(body);

    return reply.status(201).send(ingredientsMapper.toResponse(ingredient));
  },

  async update(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = ingredientIdParamsSchema.parse(request.params);
    const body = updateIngredientSchema.parse(request.body);

    const ingredient = await ingredientsService.update(id, body);

    if (!ingredient) {
      throw new NotFoundError("Ingredient not found");
    }

    return reply.send(ingredientsMapper.toResponse(ingredient));
  },

  async deactivate(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = ingredientIdParamsSchema.parse(request.params);

    const ingredient = await ingredientsService.deactivate(id);

    if (!ingredient) {
      throw new NotFoundError("Ingredient not found");
    }

    return reply.send(ingredientsMapper.toResponse(ingredient));
  },
};