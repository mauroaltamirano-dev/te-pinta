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

export async function registerAppRoutes(app: FastifyInstance) {
  await app.register(healthRoute);
  await app.register(rootRoute);
  await app.register(clientsRoute);
  await app.register(categoriesRoute);
  await app.register(productsRoute);
  await app.register(ingredientsRoute);
  await app.register(recipesRoute);
  await app.register(productionRoute);
  await app.register(ordersRoute);
  await app.register(purchasesRoute);
  await app.register(dashboardRoute);
}