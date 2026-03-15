import type { FastifyReply, FastifyRequest } from 'fastify';

import { productionMapper } from './production.mapper';
import {
  productionProductParamsSchema,
  productionRequirementSchema,
  productionRequirementsBatchSchema,
} from './production.schema';
import { productionService } from './production.service';

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

export const productionController = {
  getProductCost(
    request: FastifyRequest<{ Params: { productId: string } }>,
    reply: FastifyReply,
  ) {
    const paramsResult = productionProductParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: 'Invalid route params',
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    try {
      const result = productionService.getProductCost(paramsResult.data.productId);

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

  getProductRequirements(
    request: FastifyRequest<{
      Params: { productId: string };
      Body: { quantity: number };
    }>,
    reply: FastifyReply,
  ) {
    const paramsResult = productionProductParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: 'Invalid route params',
        issues: formatZodIssues(paramsResult.error.issues),
      });
    }

    const bodyResult = productionRequirementSchema.safeParse(request.body);

    if (!bodyResult.success) {
      return reply.status(400).send({
        message: 'Invalid request body',
        issues: formatZodIssues(bodyResult.error.issues),
      });
    }

    try {
      const result = productionService.getProductRequirements(
        paramsResult.data.productId,
        bodyResult.data,
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

  getIngredientsNeededFromOrders(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const result = productionService.getIngredientsNeededFromOrders();

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

  getBatchRequirements(
    request: FastifyRequest<{
      Body: {
        items: Array<{ productId: string; quantity: number }>;
      };
    }>,
    reply: FastifyReply,
  ) {
    const bodyResult = productionRequirementsBatchSchema.safeParse(request.body);

    if (!bodyResult.success) {
      return reply.status(400).send({
        message: 'Invalid request body',
        issues: formatZodIssues(bodyResult.error.issues),
      });
    }

    try {
      const result = productionService.getBatchRequirements(bodyResult.data);

      return reply.send({
        items: result.items.map((item) => ({
          ...item,
          requiredQuantityInBaseUnit: productionMapper.round(
            item.requiredQuantityInBaseUnit,
          ),
        })),
      });
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
};