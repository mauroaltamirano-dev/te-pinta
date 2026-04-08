import type { FastifyInstance } from 'fastify';

import { dashboardController } from './dashboard.controller';

export async function dashboardRoute(app: FastifyInstance) {
  app.get('/dashboard/sales', dashboardController.getSales);
  app.get('/dashboard/operational', dashboardController.getOperational);
}