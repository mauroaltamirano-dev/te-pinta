import type { FastifyInstance } from 'fastify';

import { env } from '../../config/env';
import { productsController } from './products.controller';

export async function productsRoute(app: FastifyInstance) {
  app.get(`${env.apiPrefix}/products`, productsController.getAll);
  app.get(`${env.apiPrefix}/products/:id`, productsController.getById);
  app.post(`${env.apiPrefix}/products`, productsController.create);
  app.patch(`${env.apiPrefix}/products/:id`, productsController.update);
  app.patch(`${env.apiPrefix}/products/:id/reactivate`, productsController.reactivate);
  app.delete(`${env.apiPrefix}/products/:id`, productsController.deactivate);
}