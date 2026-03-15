import { z } from 'zod';

export const recipeIdParamsSchema = z.object({
  id: z.uuid('Recipe id must be a valid UUID'),
});

export const recipeProductParamsSchema = z.object({
  productId: z.uuid('Product id must be a valid UUID'),
});

export const recipeItemParamsSchema = z.object({
  id: z.uuid('Recipe id must be a valid UUID'),
  itemId: z.uuid('Recipe item id must be a valid UUID'),
});

export const recipeUnitSchema = z.enum(['kg', 'g', 'l', 'ml', 'unit']);

export const createRecipeSchema = z.object({
  productId: z.uuid('Product id must be a valid UUID'),
  yieldQuantity: z.number().positive('Yield quantity must be greater than 0').optional(),
  notes: z.string().trim().optional(),
});

export const updateRecipeSchema = z
  .object({
    yieldQuantity: z.number().positive('Yield quantity must be greater than 0').optional(),
    notes: z.string().trim().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const createRecipeItemSchema = z.object({
  ingredientId: z.uuid('Ingredient id must be a valid UUID'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unit: recipeUnitSchema,
});

export const updateRecipeItemSchema = createRecipeItemSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'At least one field must be provided',
  },
);