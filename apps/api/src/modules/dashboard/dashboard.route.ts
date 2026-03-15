import type { FastifyInstance } from 'fastify';

import { env } from '../../config/env';
import { dashboardController } from './dashboard.controller';

export async function dashboardRoute(app: FastifyInstance) {
  app.get(`${env.apiPrefix}/dashboard/sales`, dashboardController.getSales);
}