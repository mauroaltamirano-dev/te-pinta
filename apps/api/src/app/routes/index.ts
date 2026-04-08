import type { FastifyInstance } from 'fastify';

import { categoriesRoute } from '../../modules/categories/categories.route';
import { clientsRoute } from '../../modules/clients/clients.route';
import { productsRoute } from '../../modules/products/products.route';
import { ingredientsRoute } from '../../modules/ingredients/ingredients.route';
import { recipesRoute } from '../../modules/recipes/recipes.route';
import { productionRoute } from '../../modules/production/production.route';
import { ordersRoute } from '../../modules/orders/orders.route';
import { healthRoute } from './health.route';
import { rootRoute } from './root.route';
import { purchasesRoute } from '../../modules/purchases/purchases.route';
import { dashboardRoute } from '../../modules/dashboard/dashboard.route';
import { weeklyClosuresRoutes } from '../../modules/weekly-closures/weekly-closures.route';
import { env } from '../../config/env';

export async function registerAppRoutes(app: FastifyInstance) {
  // Health and root routes — no prefix
  await app.register(healthRoute);
  await app.register(rootRoute);

  // All API routes under /api/v1 prefix
  await app.register(
    async function apiRoutes(api) {
      await api.register(clientsRoute);
      await api.register(categoriesRoute);
      await api.register(productsRoute);
      await api.register(ingredientsRoute);
      await api.register(recipesRoute);
      await api.register(productionRoute);
      await api.register(ordersRoute);
      await api.register(purchasesRoute);
      await api.register(dashboardRoute);
      await api.register(weeklyClosuresRoutes);
    },
    { prefix: env.apiPrefix },
  );
}