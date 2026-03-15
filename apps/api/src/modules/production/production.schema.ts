import { z } from 'zod';

export const productionProductParamsSchema = z.object({
  productId: z.uuid('Product id must be a valid UUID'),
});

export const productionRequirementSchema = z.object({
  quantity: z.number().positive('Quantity must be greater than 0'),
});

export const productionRequirementsBatchSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.uuid('Product id must be a valid UUID'),
        quantity: z.number().positive('Quantity must be greater than 0'),
      }),
    )
    .min(1, 'At least one production item is required'),
});