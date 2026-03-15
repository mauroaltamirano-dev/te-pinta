import type { FastifyInstance } from 'fastify';

import { env } from '../../config/env';
import { categoriesController } from './categories.controller';

export async function categoriesRoute(app: FastifyInstance) {
  app.get(`${env.apiPrefix}/categories`, categoriesController.getAll);
  app.get(`${env.apiPrefix}/categories/:id`, categoriesController.getById);
  app.post(`${env.apiPrefix}/categories`, categoriesController.create);
  app.patch(`${env.apiPrefix}/categories/:id`, categoriesController.update);
  app.delete(`${env.apiPrefix}/categories/:id`, categoriesController.deactivate);
}