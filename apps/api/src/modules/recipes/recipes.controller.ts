import type { FastifyReply, FastifyRequest } from 'fastify';

import { NotFoundError } from '../../shared/errors/app-error';
import { recipesMapper } from './recipes.mapper';
import {
  createRecipeItemSchema,
  createRecipeSchema,
  recipeIdParamsSchema,
  recipeItemParamsSchema,
  recipeProductParamsSchema,
  updateRecipeItemSchema,
  updateRecipeSchema,
} from './recipes.schema';
import { recipesService } from './recipes.service';

export const recipesController = {
  async getAllRecipes(_request: FastifyRequest, reply: FastifyReply) {
    const recipes = await recipesService.getAllRecipes();
    return reply.send(recipesMapper.toRecipeListResponse(recipes));
  },

  // ── nuevo ────────────────────────────────────────────────────
  async getAllRecipeItems(_request: FastifyRequest, reply: FastifyReply) {
    const items = await recipesService.getAllRecipeItems();
    return reply.send(recipesMapper.toRecipeItemListResponse(items));
  },

  async getRecipeById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = recipeIdParamsSchema.parse(request.params);

    const recipe = await recipesService.getRecipeById(id);

    if (!recipe) {
      throw new NotFoundError('Recipe not found');
    }

    return reply.send(recipesMapper.toRecipeResponse(recipe));
  },

  async getRecipeByProductId(
    request: FastifyRequest<{
      Params: { productId: string };
      Querystring: { includeInactive?: string };
    }>,
    reply: FastifyReply,
  ) {
    const { productId } = recipeProductParamsSchema.parse(request.params);

    const includeInactive = request.query.includeInactive === 'true';
    const recipe = await recipesService.getRecipeByProductId(
      productId,
      { includeInactive },
    );

    if (!recipe) {
      throw new NotFoundError('Recipe not found for this product');
    }

    return reply.send(recipesMapper.toRecipeResponse(recipe));
  },

  async createRecipe(request: FastifyRequest, reply: FastifyReply) {
    const body = createRecipeSchema.parse(request.body);

    const recipe = await recipesService.createRecipe(body);
    return reply.status(201).send(recipesMapper.toRecipeResponse(recipe));
  },

  async updateRecipe(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = recipeIdParamsSchema.parse(request.params);
    const body = updateRecipeSchema.parse(request.body);

    const recipe = await recipesService.updateRecipe(id, body);

    if (!recipe) {
      throw new NotFoundError('Recipe not found');
    }

    return reply.send(recipesMapper.toRecipeResponse(recipe));
  },

  async deactivateRecipe(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = recipeIdParamsSchema.parse(request.params);

    const recipe = await recipesService.deactivateRecipe(id);

    if (!recipe) {
      throw new NotFoundError('Recipe not found');
    }

    return reply.send(recipesMapper.toRecipeResponse(recipe));
  },

  async reactivateRecipe(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = recipeIdParamsSchema.parse(request.params);

    const recipe = await recipesService.reactivateRecipe(id);

    if (!recipe) {
      throw new NotFoundError('Recipe not found');
    }

    return reply.send(recipesMapper.toRecipeResponse(recipe));
  },

  async getRecipeItems(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = recipeIdParamsSchema.parse(request.params);

    const recipe = await recipesService.getRecipeById(id);

    if (!recipe) {
      throw new NotFoundError('Recipe not found');
    }

    const items = await recipesService.getRecipeItems(id);
    return reply.send(recipesMapper.toRecipeItemListResponse(items));
  },

  async createRecipeItem(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = recipeIdParamsSchema.parse(request.params);
    const body = createRecipeItemSchema.parse(request.body);

    const item = await recipesService.createRecipeItem(
      id,
      body,
    );
    return reply.status(201).send(recipesMapper.toRecipeItemResponse(item));
  },

  async updateRecipeItem(
    request: FastifyRequest<{ Params: { id: string; itemId: string } }>,
    reply: FastifyReply,
  ) {
    const { id, itemId } = recipeItemParamsSchema.parse(request.params);
    const body = updateRecipeItemSchema.parse(request.body);

    const item = await recipesService.updateRecipeItem(
      id,
      itemId,
      body,
    );

    if (!item) {
      throw new NotFoundError('Recipe item not found');
    }

    return reply.send(recipesMapper.toRecipeItemResponse(item));
  },

  async deleteRecipeItem(
    request: FastifyRequest<{ Params: { id: string; itemId: string } }>,
    reply: FastifyReply,
  ) {
    const { id, itemId } = recipeItemParamsSchema.parse(request.params);

    const item = await recipesService.deleteRecipeItem(
      id,
      itemId,
    );

    if (!item) {
      throw new NotFoundError('Recipe item not found');
    }

    return reply.send(recipesMapper.toRecipeItemResponse(item));
  },
};