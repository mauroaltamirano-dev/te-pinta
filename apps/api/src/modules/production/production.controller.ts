import type { FastifyReply, FastifyRequest } from 'fastify';

import { productionMapper } from './production.mapper';
import {
  productionProductParamsSchema,
  productionRequirementSchema,
  productionRequirementsBatchSchema,
} from './production.schema';
import { productionService } from './production.service';

export const productionController = {
  async getProductCost(
    request: FastifyRequest<{ Params: { productId: string } }>,
    reply: FastifyReply,
  ) {
    const { productId } = productionProductParamsSchema.parse(request.params);

    const result = await productionService.getProductCost(productId);

    return reply.send({
      product: result.product,
      recipeId: result.recipeId,
      yieldQuantity: result.yieldQuantity,
      totalUnitCost: productionMapper.round(result.totalUnitCost),
      items: result.items.map((item) => ({
        ...item,
        normalizedQuantityInBaseUnit: productionMapper.round(
          item.normalizedQuantityInBaseUnit,
        ),
        ingredientCurrentCost: productionMapper.round(item.ingredientCurrentCost),
        ingredientCostPerBaseUnit: productionMapper.round(
          item.ingredientCostPerBaseUnit,
        ),
        totalCost: productionMapper.round(item.totalCost),
      })),
    });
  },

  async getProductRequirements(
    request: FastifyRequest<{
      Params: { productId: string };
      Body: { quantity: number };
    }>,
    reply: FastifyReply,
  ) {
    const { productId } = productionProductParamsSchema.parse(request.params);
    const body = productionRequirementSchema.parse(request.body);

    const result = await productionService.getProductRequirements(
      productId,
      body,
    );

    return reply.send({
      product: result.product,
      recipeId: result.recipeId,
      requestedQuantity: result.requestedQuantity,
      items: result.items.map((item) => ({
        ...item,
        requiredQuantityInBaseUnit: productionMapper.round(
          item.requiredQuantityInBaseUnit,
        ),
      })),
    });
  },

  async getIngredientsNeededFromOrders(
    _request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const result = await productionService.getIngredientsNeededFromOrders();

    return reply.send({
      ordersConsidered: result.ordersConsidered,
      productsCalculated: result.productsCalculated,
      items: result.items.map((item) => ({
        ...item,
        requiredQuantityInBaseUnit: productionMapper.round(
          item.requiredQuantityInBaseUnit,
        ),
      })),
    });
  },

  async getBatchRequirements(
    request: FastifyRequest<{
      Body: {
        items: Array<{ productId: string; quantity: number }>;
      };
    }>,
    reply: FastifyReply,
  ) {
    const body = productionRequirementsBatchSchema.parse(request.body);

    const result = await productionService.getBatchRequirements(body);

    return reply.send({
      items: result.items.map((item) => ({
        ...item,
        requiredQuantityInBaseUnit: productionMapper.round(
          item.requiredQuantityInBaseUnit,
        ),
      })),
    });
  },
};