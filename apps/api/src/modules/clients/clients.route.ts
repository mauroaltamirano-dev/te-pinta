import type { FastifyInstance } from 'fastify';

import { clientsController } from './clients.controller';

export async function clientsRoute(app: FastifyInstance) {
  app.get('/clients',              clientsController.getAll);
  app.get('/clients/:id',          clientsController.getById);
  app.get('/clients/:id/stats',    clientsController.getStats);
  app.post('/clients',             clientsController.create);
  app.patch('/clients/:id',        clientsController.update);
  app.delete('/clients/:id',       clientsController.deactivate);
  app.patch('/clients/:id/reactivate', clientsController.reactivate);
}