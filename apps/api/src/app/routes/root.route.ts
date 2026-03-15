import type { FastifyInstance } from 'fastify';

import { env } from '../../config/env';

export async function rootRoute(app: FastifyInstance) {
  app.get(env.apiPrefix, async () => {
    return {
      message: 'API base funcionando',
      version: 'v1',
    };
  });
}