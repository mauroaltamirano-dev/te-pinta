import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildServer } from "../src/app/server/build-server";

let app: ReturnType<typeof buildServer> | null = null;

async function getApp() {
  if (!app) {
    app = buildServer();
    await app.ready();
  }
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const fastify = await getApp();

  const response = await fastify.inject({
    method: req.method as
      | "GET"
      | "POST"
      | "PATCH"
      | "DELETE"
      | "PUT"
      | "OPTIONS"
      | "HEAD",
    url: req.url ?? "/",
    headers: req.headers as Record<string, string>,
    payload: req.body ? JSON.stringify(req.body) : undefined,
  });

  res.status(response.statusCode);

  for (const [key, value] of Object.entries(response.headers)) {
    res.setHeader(key, value as string | string[]);
  }

  res.send(response.rawPayload);
}