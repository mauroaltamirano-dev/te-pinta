import type { z } from 'zod';

import type {
  createPurchaseSchema,
  purchaseTypeSchema,
  updatePurchaseSchema,
} from './purchases.schema';

export type PurchaseType = z.infer<typeof purchaseTypeSchema>;

export type Purchase = {
  id: string;
  date: string;
  type: PurchaseType;
  ingredientId: string | null;
  nameSnapshot: string;
  quantity: number | null;
  unit: 'kg' | 'g' | 'l' | 'ml' | 'unit' | null;
  unitPrice: number | null;
  totalAmount: number;
  supplier: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PurchasesSummary = {
  totalAmount: number;
  ingredientTotal: number;
  operationalTotal: number;
  investmentTotal: number;
  count: number;
};

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
export type UpdatePurchaseInput = z.infer<typeof updatePurchaseSchema>;