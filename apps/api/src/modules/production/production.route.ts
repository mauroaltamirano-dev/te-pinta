import type { FastifyInstance } from 'fastify';

import { env } from '../../config/env';
import { productionController } from './production.controller';

export async function productionRoute(app: FastifyInstance) {
  app.get(
    `${env.apiPrefix}/production/costs/product/:productId`,
    productionController.getProductCost,
  );

  app.post(
    `${env.apiPrefix}/production/requirements/product/:productId`,
    productionController.getProductRequirements,
  );

  app.post(
    `${env.apiPrefix}/production/requirements`,
    productionController.getBatchRequirements,
  );

  app.get(
    `${env.apiPrefix}/production/ingredients-needed`,
    productionController.getIngredientsNeededFromOrders,
  );
}