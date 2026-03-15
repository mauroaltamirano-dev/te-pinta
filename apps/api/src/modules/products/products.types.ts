import type { z } from 'zod';

import type {
  createProductSchema,
  productKindSchema,
  updateProductSchema,
} from './products.schema';

export type ProductKind = z.infer<typeof productKindSchema>;

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  kind: ProductKind;
  unitPrice: number;
  halfDozenPrice: number | null;
  dozenPrice: number | null;
  directCost: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductResponse = {
  id: string;
  categoryId: string;
  categoryName: string | null;
  name: string;
  description: string | null;
  kind: ProductKind;
  unitPrice: number;
  halfDozenPrice: number | null;
  dozenPrice: number | null;
  directCost: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;