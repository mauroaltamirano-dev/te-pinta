import type { FastifyInstance } from 'fastify';

import { categoriesController } from './categories.controller';

export async function categoriesRoute(app: FastifyInstance) {
  app.get('/categories', categoriesController.getAll);
  app.get('/categories/:id', categoriesController.getById);
  app.post('/categories', categoriesController.create);
  app.patch('/categories/:id', categoriesController.update);
  app.delete('/categories/:id', categoriesController.deactivate);
  app.patch('/categories/:id/reactivate', categoriesController.reactivate);
}