import type { FastifyInstance } from 'fastify';

import { ordersController } from './orders.controller';

export async function ordersRoute(app: FastifyInstance) {
  app.get('/orders', ordersController.getAllOrders);
  app.get('/orders/:id', ordersController.getOrderById);
  app.post('/orders', ordersController.createOrder);
  app.patch('/orders/:id', ordersController.updateOrder);
  app.patch(
    '/orders/:id/status',
    ordersController.updateOrderStatus,
  );
  app.delete('/orders/:id', ordersController.deactivateOrder);
  app.patch(
    '/orders/:id/reactivate',
    ordersController.reactivateOrder,
  );
  app.delete(
    '/orders/:id/hard-delete',
    ordersController.hardDeleteOrder,
  );
  app.get('/orders-summary', ordersController.getSummary);
  app.get(
    '/orders-operational-summary',
    ordersController.getOperationalSummary,
  );
}