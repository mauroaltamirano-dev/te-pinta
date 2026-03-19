// ─────────────────────────────────────────────────────────────
// DRIZZLE DB SCHEMA — agregar esta tabla en tu db/schema.ts
// ─────────────────────────────────────────────────────────────
//

// ─────────────────────────────────────────────────────────────
// ZOD VALIDATION SCHEMAS
// ─────────────────────────────────────────────────────────────

import { z } from 'zod';

export const clientIdParamsSchema = z.object({
  id: z.uuid('Client id must be a valid UUID'),
});

export const createClientSchema = z.object({
  name:    z.string().trim().min(1, 'El nombre es obligatorio'),
  phone:   z.string().trim().optional(),
  address: z.string().trim().optional(),
  notes:   z.string().trim().optional(),
});

export const updateClientSchema = createClientSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });