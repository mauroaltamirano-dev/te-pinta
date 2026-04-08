import "dotenv/config";
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

const allowedOrigins = (process.env.WEB_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""))
  .filter(Boolean);

function setCorsHeaders(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers["origin"] as string | undefined;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Vary", "Origin");
    return true;
  }

  return false;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

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
    if (value !== undefined && key.toLowerCase() !== "access-control-allow-origin") {
      res.setHeader(key, value as string | string[]);
    }
  }

  res.end(response.rawPayload);
}
