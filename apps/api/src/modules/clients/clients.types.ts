import type { z } from 'zod';

import type {
  createClientSchema,
  updateClientSchema,
} from './clients.schema';

export type Client = {
  id:        string;
  name:      string;
  phone:     string | null;
  address:   string | null;
  notes:     string | null;
  isActive:  boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;