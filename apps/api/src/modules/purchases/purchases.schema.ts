import { z } from 'zod';

export const purchaseIdParamsSchema = z.object({
  id: z.uuid('Purchase id must be a valid UUID'),
});

export const purchaseTypeSchema = z.enum([
  'ingredient',
  'operational',
  'investment',
]);

export const purchaseUnitSchema = z.enum(['kg', 'g', 'l', 'ml', 'unit']);

const purchaseBaseSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  type: purchaseTypeSchema,
  ingredientId: z.uuid('Ingredient id must be a valid UUID').optional(),
  nameSnapshot: z.string().trim().min(1, 'Name is required'),
  quantity: z.number().positive('Quantity must be greater than 0').optional(),
  unit: purchaseUnitSchema.optional(),
  unitPrice: z.number().min(0, 'Unit price must be greater or equal to 0').optional(),
  totalAmount: z.number().min(0, 'Total amount must be greater or equal to 0'),
  supplier: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const createPurchaseSchema = purchaseBaseSchema.superRefine((data, ctx) => {
  if (data.type === 'ingredient') {
    if (!data.ingredientId) {
      ctx.addIssue({
        code: 'custom',
        path: ['ingredientId'],
        message: 'Ingredient is required for ingredient purchases',
      });
    }

    if (data.quantity === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['quantity'],
        message: 'Quantity is required for ingredient purchases',
      });
    }

    if (!data.unit) {
      ctx.addIssue({
        code: 'custom',
        path: ['unit'],
        message: 'Unit is required for ingredient purchases',
      });
    }

    if (data.unitPrice === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['unitPrice'],
        message: 'Unit price is required for ingredient purchases',
      });
    }
  }
});

export const updatePurchaseSchema = purchaseBaseSchema
  .partial()
  .superRefine((data, ctx) => {
    if (Object.keys(data).length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: [],
        message: 'At least one field must be provided',
      });
    }
  });