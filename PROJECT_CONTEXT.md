# Te Pinta — Project Context

Sistema web de gestión interna para un emprendimiento gastronómico (rotisería / empanadas).

Este documento describe el contexto técnico completo del proyecto para que cualquier desarrollador o IA pueda continuar el desarrollo sin perder información.

---

## Objetivo del Sistema

Te Pinta es un sistema de gestión gastronómica que permite administrar:

- Pedidos (orders)
- Producción
- Ingredientes
- Recetas
- Productos y categorías
- Costos y rentabilidad
- Compras (purchases)
- Cierres semanales (weekly closures)
- Dashboard de ventas y operacional
- Clientes

El objetivo es centralizar la operación diaria de una rotisería y permitir control de costos y rentabilidad.

---

## Stack Tecnológico

### Frontend
- React 18+
- TypeScript
- Vite
- TailwindCSS
- TanStack Query (React Query)
- React Hook Form

### Backend
- Node.js
- Fastify 5
- TypeScript
- Zod v4 (validaciones de entrada y env)
- Drizzle ORM
- Pino (logging via Fastify)

### Base de Datos
- Neon (PostgreSQL serverless)
- Drizzle Kit para migraciones

### Infraestructura
- pnpm workspaces (monorepo)
- Backend → Vercel (serverless)
- Frontend → Netlify

---

## Estructura del Proyecto

```
te-pinta/
├── apps/
│   ├── api/                    # Backend Fastify
│   │   ├── api/index.ts        # Vercel handler (serverless entry)
│   │   ├── src/
│   │   │   ├── index.ts        # Local dev entry point
│   │   │   ├── config/         # env.ts (Zod validated), logger
│   │   │   ├── db/             # Schema Drizzle, client, repos
│   │   │   ├── app/            # Server, plugins, routes registration
│   │   │   └── modules/        # Feature modules (route, controller, service, repo)
│   │   ├── drizzle/            # Migrations
│   │   └── vercel.json         # Vercel config (rewrites)
│   └── web/                    # Frontend React
│       ├── src/
│       │   ├── services/api/   # API client (fetch-based)
│       │   └── ...
│       ├── .env                # VITE_API_URL (dev)
│       └── .env.production     # VITE_API_URL (prod)
├── .env.example                # Template de variables de entorno
├── CLAUDE.md                   # Contexto para IA
└── package.json                # Root monorepo scripts
```

### Módulos del Backend

Cada módulo en `src/modules/` contiene:
- `{feature}.route.ts` — Rutas (paths relativos, el prefix lo agrega Fastify)
- `{feature}.controller.ts` — Controllers (request/response handling)
- `{feature}.service.ts` — Lógica de negocio
- `{feature}.repository.ts` — Acceso a datos (Drizzle)

Módulos: categories, clients, dashboard, finance, ingredients, ledger, orders, production, products, purchases, recipes, users, weekly-closures

---

## Variables de Entorno (Backend)

| Variable | Requerida | Descripción |
|---|---|---|
| DATABASE_URL | ✅ | Connection string PostgreSQL (Neon) |
| WEB_ORIGINS | ✅ (tiene default) | CORS origins separados por coma |
| PORT | No | Puerto del server (default: 3001) |
| API_PREFIX | No | Prefix de API (default: /api/v1) |
| NODE_ENV | No | development / test / production |
| LOG_LEVEL | No | Nivel de log (default: debug en dev) |

Validadas con Zod al startup — si falta algo requerido, el server no arranca.
