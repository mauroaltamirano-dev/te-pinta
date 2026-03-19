import type { FastifyInstance } from 'fastify';

import { env } from '../../config/env';
import { recipesController } from './recipes.controller';

export async function recipesRoute(app: FastifyInstance) {
  app.get(`${env.apiPrefix}/recipes`, recipesController.getAllRecipes);
  app.get(`${env.apiPrefix}/recipes/items`, recipesController.getAllRecipeItems); // ← nuevo
  app.get(`${env.apiPrefix}/recipes/:id`, recipesController.getRecipeById);
  app.get(
    `${env.apiPrefix}/recipes/product/:productId`,
    recipesController.getRecipeByProductId,
  );

  app.post(`${env.apiPrefix}/recipes`, recipesController.createRecipe);
  app.patch(`${env.apiPrefix}/recipes/:id`, recipesController.updateRecipe);
  app.patch(`${env.apiPrefix}/recipes/:id/reactivate`, recipesController.reactivateRecipe);
  app.delete(`${env.apiPrefix}/recipes/:id`, recipesController.deactivateRecipe);

  app.get(`${env.apiPrefix}/recipes/:id/items`, recipesController.getRecipeItems);
  app.post(`${env.apiPrefix}/recipes/:id/items`, recipesController.createRecipeItem);
  app.patch(
    `${env.apiPrefix}/recipes/:id/items/:itemId`,
    recipesController.updateRecipeItem,
  );
  app.delete(
    `${env.apiPrefix}/recipes/:id/items/:itemId`,
    recipesController.deleteRecipeItem,
  );
}