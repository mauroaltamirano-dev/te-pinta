# Te Pinta — Contexto para IA

## Stack
- Runtime: Node.js + TypeScript
- Framework: Fastify 5
- ORM: Drizzle ORM
- DB: Neon (PostgreSQL serverless)
- Validación: Zod v4
- Logs: Pino (via Fastify)
- Frontend: React + Vite + TailwindCSS + TanStack Query

## Arquitectura Backend
Estructura modular por feature:
- src/modules/{feature}/     → route, controller, service, repository
- src/config/                → env (validado con Zod), logger
- src/db/                    → schema Drizzle, client, migrations
- src/app/                   → server setup, plugins, route registration

Las rutas usan el prefix nativo de Fastify (`{ prefix: env.apiPrefix }`).
Cada módulo define rutas relativas (ej: `/clients`, no `/api/v1/clients`).

## Infraestructura
- Monorepo con pnpm workspaces
- Backend deploy: Vercel (serverless via api/index.ts handler)
- Frontend deploy: Netlify
- DB: Neon serverless PostgreSQL

## Reglas
- Nunca usar `any` en TypeScript sin justificación
- Nunca hardcodear secrets — siempre `.env`
- Validar con Zod antes de cualquier llamada a DB
- Las variables de entorno se validan al startup con Zod (src/config/env.ts)
- CORS configurado con WEB_ORIGINS desde env