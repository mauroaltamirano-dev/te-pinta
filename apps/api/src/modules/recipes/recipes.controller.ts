import type { FastifyReply, FastifyRequest } from 'fastify';

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

export const recipesController = {
  getAllRecipes(_request: FastifyRequest, reply: FastifyReply) {
    const recipes = recipesService.getAllRecipes();

    return reply.send(recipesMapper.toRecipeListResponse(recipes));
  },

  getRecipeById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const paramsResult = recipeIdParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: 'Invalid route params',
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const recipe = recipesService.getRecipeById(paramsResult.data.id);

    if (!recipe) {
      return reply.status(404).send({
        message: 'Recipe not found',
      });
    }

    return reply.send(recipesMapper.toRecipeResponse(recipe));
  },

  getRecipeByProductId(
    request: FastifyRequest<{ Params: { productId: string } }>,
    reply: FastifyReply,
  ) {
    const paramsResult = recipeProductParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: 'Invalid route params',
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const recipe = recipesService.getRecipeByProductId(paramsResult.data.productId);

    if (!recipe) {
      return reply.status(404).send({
        message: 'Recipe not found for this product',
      });
    }

    return reply.send(recipesMapper.toRecipeResponse(recipe));
  },

  createRecipe(request: FastifyRequest, reply: FastifyReply) {
    const bodyResult = createRecipeSchema.safeParse(request.body);

    if (!bodyResult.success) {
      return reply.status(400).send({
        message: 'Invalid request body',
        issues: formatZodIssues(bodyResult.error.issues),
      });
    }

    try {
      const recipe = recipesService.createRecipe(bodyResult.data);

      return reply.status(201).send(recipesMapper.toRecipeResponse(recipe));
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

  updateRecipe(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const paramsResult = recipeIdParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: 'Invalid route params',
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const bodyResult = updateRecipeSchema.safeParse(request.body);

    if (!bodyResult.success) {
      return reply.status(400).send({
        message: 'Invalid request body',
        issues: formatZodIssues(bodyResult.error.issues),
      });
    }

    const recipe = recipesService.updateRecipe(paramsResult.data.id, bodyResult.data);

    if (!recipe) {
      return reply.status(404).send({
        message: 'Recipe not found',
      });
    }

    return reply.send(recipesMapper.toRecipeResponse(recipe));
  },

  deactivateRecipe(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const paramsResult = recipeIdParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: 'Invalid route params',
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const recipe = recipesService.deactivateRecipe(paramsResult.data.id);

    if (!recipe) {
      return reply.status(404).send({
        message: 'Recipe not found',
      });
    }

    return reply.send(recipesMapper.toRecipeResponse(recipe));
  },

  getRecipeItems(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const paramsResult = recipeIdParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: 'Invalid route params',
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const recipe = recipesService.getRecipeById(paramsResult.data.id);

    if (!recipe) {
      return reply.status(404).send({
        message: 'Recipe not found',
      });
    }

    const items = recipesService.getRecipeItems(paramsResult.data.id);

    return reply.send(recipesMapper.toRecipeItemListResponse(items));
  },

  createRecipeItem(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const paramsResult = recipeIdParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: 'Invalid route params',
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const bodyResult = createRecipeItemSchema.safeParse(request.body);

    if (!bodyResult.success) {
      return reply.status(400).send({
        message: 'Invalid request body',
        issues: formatZodIssues(bodyResult.error.issues),
      });
    }

    try {
      const item = recipesService.createRecipeItem(paramsResult.data.id, bodyResult.data);

      return reply.status(201).send(recipesMapper.toRecipeItemResponse(item));
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

  updateRecipeItem(
    request: FastifyRequest<{ Params: { id: string; itemId: string } }>,
    reply: FastifyReply,
  ) {
    const paramsResult = recipeItemParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: 'Invalid route params',
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const bodyResult = updateRecipeItemSchema.safeParse(request.body);

    if (!bodyResult.success) {
      return reply.status(400).send({
        message: 'Invalid request body',
        issues: formatZodIssues(bodyResult.error.issues),
      });
    }

    try {
      const item = recipesService.updateRecipeItem(
        paramsResult.data.id,
        paramsResult.data.itemId,
        bodyResult.data,
      );

      if (!item) {
        return reply.status(404).send({
          message: 'Recipe item not found',
        });
      }

      return reply.send(recipesMapper.toRecipeItemResponse(item));
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

  deleteRecipeItem(
    request: FastifyRequest<{ Params: { id: string; itemId: string } }>,
    reply: FastifyReply,
  ) {
    const paramsResult = recipeItemParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: 'Invalid route params',
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    try {
      const item = recipesService.deleteRecipeItem(
        paramsResult.data.id,
        paramsResult.data.itemId,
      );

      if (!item) {
        return reply.status(404).send({
          message: 'Recipe item not found',
        });
      }

      return reply.send(recipesMapper.toRecipeItemResponse(item));
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
};