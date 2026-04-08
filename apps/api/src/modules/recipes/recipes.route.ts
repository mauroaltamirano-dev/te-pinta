import type { FastifyInstance } from 'fastify';

import { recipesController } from './recipes.controller';

export async function recipesRoute(app: FastifyInstance) {
  app.get('/recipes', recipesController.getAllRecipes);
  app.get('/recipes/items', recipesController.getAllRecipeItems);
  app.get('/recipes/:id', recipesController.getRecipeById);
  app.get(
    '/recipes/product/:productId',
    recipesController.getRecipeByProductId,
  );

  app.post('/recipes', recipesController.createRecipe);
  app.patch('/recipes/:id', recipesController.updateRecipe);
  app.patch('/recipes/:id/reactivate', recipesController.reactivateRecipe);
  app.delete('/recipes/:id', recipesController.deactivateRecipe);

  app.get('/recipes/:id/items', recipesController.getRecipeItems);
  app.post('/recipes/:id/items', recipesController.createRecipeItem);
  app.patch(
    '/recipes/:id/items/:itemId',
    recipesController.updateRecipeItem,
  );
  app.delete(
    '/recipes/:id/items/:itemId',
    recipesController.deleteRecipeItem,
  );
}