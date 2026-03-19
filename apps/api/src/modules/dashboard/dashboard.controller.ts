import type { FastifyReply, FastifyRequest } from 'fastify';

import { getSalesDashboardQuerySchema } from './dashboard.schema';
import { dashboardService }             from './dashboard.service';

export const dashboardController = {
  async getSales(request: FastifyRequest, reply: FastifyReply) {
    const query = getSalesDashboardQuerySchema.parse(request.query);

    const dashboard = await dashboardService.getSalesDashboard(query);
    return reply.send(dashboard);
  },
};