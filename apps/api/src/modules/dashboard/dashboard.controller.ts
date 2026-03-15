import type { FastifyReply, FastifyRequest } from 'fastify';

import { dashboardMapper } from './dashboard.mapper';
import { getSalesDashboardQuerySchema } from './dashboard.schema';
import { dashboardService } from './dashboard.service';

function formatZodIssues(
  issues: Array<{ path: PropertyKey[]; message: string }>,
) {
  return issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
}

export const dashboardController = {
  getSales(request: FastifyRequest, reply: FastifyReply) {
    const queryResult = getSalesDashboardQuerySchema.safeParse(request.query);

    if (!queryResult.success) {
      return reply.status(400).send({
        message: 'Invalid query params',
        issues: formatZodIssues(queryResult.error.issues),
      });
    }

    try {
      const dashboard = dashboardService.getSalesDashboard(queryResult.data);

      return reply.send(dashboardMapper.toSalesResponse(dashboard));
    } catch {
      return reply.status(500).send({
        message: 'Unexpected error',
      });
    }
  },
};