import type { FastifyInstance } from 'fastify';

import { env } from '../../config/env';
import { clientsController } from './clients.controller';

export async function clientsRoute(app: FastifyInstance) {
  app.get(`${env.apiPrefix}/clients`, clientsController.getAll);
  app.get(`${env.apiPrefix}/clients/:id`, clientsController.getById);
  app.post(`${env.apiPrefix}/clients`, clientsController.create);
  app.patch(`${env.apiPrefix}/clients/:id`, clientsController.update);
  app.delete(`${env.apiPrefix}/clients/:id`, clientsController.deactivate);
}