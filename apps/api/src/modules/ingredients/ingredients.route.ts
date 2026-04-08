import type { FastifyInstance } from 'fastify';

import { ingredientsController } from './ingredients.controller';

export async function ingredientsRoute(app: FastifyInstance) {
  app.get('/ingredients', ingredientsController.getAll);
  app.get('/ingredients/:id', ingredientsController.getById);
  app.post('/ingredients', ingredientsController.create);
  app.patch('/ingredients/:id', ingredientsController.update);
  app.delete('/ingredients/:id', ingredientsController.deactivate);
}