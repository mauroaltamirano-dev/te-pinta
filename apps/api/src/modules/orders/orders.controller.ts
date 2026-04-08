import type { FastifyReply, FastifyRequest } from "fastify";

import { NotFoundError } from "../../shared/errors/app-error";
import { ordersMapper } from "./orders.mapper";
import {
  createOrderSchema,
  orderIdParamsSchema,
  updateOrderSchema,
  updateOrderStatusSchema,
} from "./orders.schema";
import { ordersService } from "./orders.service";
import { z } from "zod";

const operationalSummaryQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional(),
});

export const ordersController = {
  async getAllOrders(_request: FastifyRequest, reply: FastifyReply) {
    const orders = await ordersService.getAllOrders();

    return reply.send(ordersMapper.toOrderListResponse(orders));
  },

async getOperationalSummary(
  request: FastifyRequest<{ Querystring: { date?: string } }>,
  reply: FastifyReply,
) {
  const { date } = operationalSummaryQuerySchema.parse(request.query);

  const summary = await ordersService.getOperationalSummary(date);

  return reply.send(ordersMapper.toOperationalSummaryResponse(summary));
},
  async getOrderById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = orderIdParamsSchema.parse(request.params);

    const result = await ordersService.getOrderById(id);

    if (!result) {
      throw new NotFoundError("Order not found");
    }

    return reply.send(
      ordersMapper.toOrderDetailResponse(result.order, result.items),
    );
  },

  async createOrder(request: FastifyRequest, reply: FastifyReply) {
    const body = createOrderSchema.parse(request.body);

    const result = await ordersService.createOrder(body);

    return reply.status(201).send(
      ordersMapper.toOrderDetailResponse(result.order, result.items),
    );
  },

  async updateOrder(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = orderIdParamsSchema.parse(request.params);
    const body = updateOrderSchema.parse(request.body);

    const result = await ordersService.updateOrder(
      id,
      body,
    );

    if (!result) {
      throw new NotFoundError("Order not found");
    }

    return reply.send(
      ordersMapper.toOrderDetailResponse(result.order, result.items),
    );
  },

  async updateOrderStatus(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = orderIdParamsSchema.parse(request.params);
    const body = updateOrderStatusSchema.parse(request.body);

    const order = await ordersService.updateOrderStatus(
      id,
      body,
    );

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    return reply.send(ordersMapper.toOrderResponse(order));
  },

  async deactivateOrder(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = orderIdParamsSchema.parse(request.params);

    const order = await ordersService.deactivateOrder(id);

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    return reply.send(ordersMapper.toOrderResponse(order));
  },

  async reactivateOrder(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = orderIdParamsSchema.parse(request.params);

    const order = await ordersService.reactivateOrder(id);

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    return reply.send(ordersMapper.toOrderResponse(order));
  },

  async hardDeleteOrder(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = orderIdParamsSchema.parse(request.params);

    const deleted = await ordersService.hardDeleteOrder(id);

    if (!deleted) {
      throw new NotFoundError("Order not found");
    }

    return reply.status(204).send();
  },

  async getSummary(_request: FastifyRequest, reply: FastifyReply) {
    const summary = await ordersService.getSummary();

    return reply.send(summary);
  },
};