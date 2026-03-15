import type { FastifyInstance } from 'fastify';

import { env } from '../../config/env';
import { ingredientsController } from './ingredients.controller';

export async function ingredientsRoute(app: FastifyInstance) {
  app.get(`${env.apiPrefix}/ingredients`, ingredientsController.getAll);
  app.get(`${env.apiPrefix}/ingredients/:id`, ingredientsController.getById);
  app.post(`${env.apiPrefix}/ingredients`, ingredientsController.create);
  app.patch(`${env.apiPrefix}/ingredients/:id`, ingredientsController.update);
  app.delete(`${env.apiPrefix}/ingredients/:id`, ingredientsController.deactivate);
}