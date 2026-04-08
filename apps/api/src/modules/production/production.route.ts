import type { FastifyInstance } from 'fastify';

import { productionController } from './production.controller';

export async function productionRoute(app: FastifyInstance) {
  app.get(
    '/production/costs/product/:productId',
    productionController.getProductCost,
  );

  app.post(
    '/production/requirements/product/:productId',
    productionController.getProductRequirements,
  );

  app.post(
    '/production/requirements',
    productionController.getBatchRequirements,
  );

  app.get(
    '/production/ingredients-needed',
    productionController.getIngredientsNeededFromOrders,
  );
}