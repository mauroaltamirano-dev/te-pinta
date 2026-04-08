import type { FastifyInstance } from 'fastify';

import { productsController } from './products.controller';

export async function productsRoute(app: FastifyInstance) {
  app.get('/products', productsController.getAll);
  app.get('/products/:id', productsController.getById);
  app.post('/products', productsController.create);
  app.patch('/products/:id', productsController.update);
  app.patch('/products/:id/reactivate', productsController.reactivate);
  app.delete('/products/:id', productsController.deactivate);
}