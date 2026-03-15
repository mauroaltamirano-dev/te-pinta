import type { FastifyInstance } from 'fastify';

import { env } from '../../config/env';
import { purchasesController } from './purchases.controller';


export async function purchasesRoute(app: FastifyInstance) {
  app.get(`${env.apiPrefix}/purchases`, purchasesController.getAll);
  app.get(`${env.apiPrefix}/purchases/:id`, purchasesController.getById);
  app.post(`${env.apiPrefix}/purchases`, purchasesController.create);
  app.patch(`${env.apiPrefix}/purchases/:id`, purchasesController.update);
  app.get(`${env.apiPrefix}/purchases-summary`, purchasesController.getSummary);
}