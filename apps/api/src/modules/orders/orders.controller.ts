import type { FastifyReply, FastifyRequest } from 'fastify';

import { ordersMapper } from './orders.mapper';
import {
  createOrderSchema,
  orderIdParamsSchema,
  updateOrderSchema,
  updateOrderStatusSchema,
} from './orders.schema';
import { ordersService } from './orders.service';

function formatZodIssues(issues: Array<{ path: PropertyKey[]; message: string }>) {
  return issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
}

function isServiceError(
  error: unknown,
): error is { statusCode: number; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    'message' in error
  );
}

export const ordersController = {
  getAllOrders(_request: FastifyRequest, reply: FastifyReply) {
    const orders = ordersService.getAllOrders();

    return reply.send(ordersMapper.toOrderListResponse(orders));
  },

  getOrderById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const paramsResult = orderIdParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: 'Invalid route params',
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const result = ordersService.getOrderById(paramsResult.data.id);

    if (!result) {
      return reply.status(404).send({
        message: 'Order not found',
      });
    }

    return reply.send(
      ordersMapper.toOrderDetailResponse(result.order, result.items),
    );
  },

  createOrder(request: FastifyRequest, reply: FastifyReply) {
    const bodyResult = createOrderSchema.safeParse(request.body);

    if (!bodyResult.success) {
      return reply.status(400).send({
        message: 'Invalid request body',
        issues: formatZodIssues(bodyResult.error.issues),
      });
    }

    try {
      const result = ordersService.createOrder(bodyResult.data);

      return reply.status(201).send(
        ordersMapper.toOrderDetailResponse(result.order, result.items),
      );
    } catch (error) {
      if (isServiceError(error)) {
        return reply.status(error.statusCode).send({
          message: error.message,
        });
      }

      return reply.status(500).send({
        message: 'Unexpected error',
      });
    }
  },

  updateOrder(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const paramsResult = orderIdParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: 'Invalid route params',
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const bodyResult = updateOrderSchema.safeParse(request.body);

    if (!bodyResult.success) {
      return reply.status(400).send({
        message: 'Invalid request body',
        issues: formatZodIssues(bodyResult.error.issues),
      });
    }

    try {
      const result = ordersService.updateOrder(
        paramsResult.data.id,
        bodyResult.data,
      );

      if (!result) {
        return reply.status(404).send({
          message: 'Order not found',
        });
      }

      return reply.send(
        ordersMapper.toOrderDetailResponse(result.order, result.items),
      );
    } catch (error) {
      if (isServiceError(error)) {
        return reply.status(error.statusCode).send({
          message: error.message,
        });
      }

      return reply.status(500).send({
        message: 'Unexpected error',
      });
    }
  },

  updateOrderStatus(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const paramsResult = orderIdParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: 'Invalid route params',
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const bodyResult = updateOrderStatusSchema.safeParse(request.body);

    if (!bodyResult.success) {
      return reply.status(400).send({
        message: 'Invalid request body',
        issues: formatZodIssues(bodyResult.error.issues),
      });
    }

    const order = ordersService.updateOrderStatus(
      paramsResult.data.id,
      bodyResult.data,
    );

    if (!order) {
      return reply.status(404).send({
        message: 'Order not found',
      });
    }

    return reply.send(ordersMapper.toOrderResponse(order));
  },

  deactivateOrder(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const paramsResult = orderIdParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: 'Invalid route params',
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const order = ordersService.deactivateOrder(paramsResult.data.id);

    if (!order) {
      return reply.status(404).send({
        message: 'Order not found',
      });
    }

    return reply.send(ordersMapper.toOrderResponse(order));
  },

  getSummary(_request: FastifyRequest, reply: FastifyReply) {
    const summary = ordersService.getSummary();

    return reply.send(summary);
  },
};