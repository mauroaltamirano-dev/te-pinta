import type { FastifyInstance } from 'fastify';

import { purchasesController } from './purchases.controller';

export async function purchasesRoute(app: FastifyInstance) {
  app.get('/purchases', purchasesController.getAll);
  app.get('/purchases/:id', purchasesController.getById);
  app.post('/purchases', purchasesController.create);
  app.patch('/purchases/:id', purchasesController.update);
  app.delete('/purchases/:id', purchasesController.remove);
  app.get('/purchases-summary', purchasesController.getSummary);
}