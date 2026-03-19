import type { FastifyInstance } from 'fastify';

import { env } from '../../config/env';
import { ordersController } from './orders.controller';

export async function ordersRoute(app: FastifyInstance) {
  app.get(`${env.apiPrefix}/orders`, ordersController.getAllOrders);
  app.get(`${env.apiPrefix}/orders/:id`, ordersController.getOrderById);
  app.post(`${env.apiPrefix}/orders`, ordersController.createOrder);
  app.patch(`${env.apiPrefix}/orders/:id`, ordersController.updateOrder);
  app.patch(
    `${env.apiPrefix}/orders/:id/status`,
    ordersController.updateOrderStatus,
  );
  app.delete(`${env.apiPrefix}/orders/:id`, ordersController.deactivateOrder);
  app.patch(
    `${env.apiPrefix}/orders/:id/reactivate`,
    ordersController.reactivateOrder,
  );
  app.delete(
    `${env.apiPrefix}/orders/:id/hard-delete`,
    ordersController.hardDeleteOrder,
  );
  app.get(`${env.apiPrefix}/orders-summary`, ordersController.getSummary);
}