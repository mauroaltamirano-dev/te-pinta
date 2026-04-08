import type { FastifyInstance } from "fastify";
import { weeklyClosuresController } from "./weekly-closures.controller";

export async function weeklyClosuresRoutes(app: FastifyInstance) {
  app.get('/weekly-closures', weeklyClosuresController.getAll);
  app.get('/weekly-closures/open', weeklyClosuresController.getCurrentOpen);
  app.get('/weekly-closures/:id', weeklyClosuresController.getById);
  app.get('/weekly-closures/:id/metrics', weeklyClosuresController.getMetrics);
  app.post('/weekly-closures', weeklyClosuresController.create);
  app.post('/weekly-closures/:id/close', weeklyClosuresController.closeClosure);
  app.delete('/weekly-closures/:id', weeklyClosuresController.delete);
}
