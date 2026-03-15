import { z } from 'zod';

export const ingredientIdParamsSchema = z.object({
  id: z.uuid('Ingredient id must be a valid UUID'),
});

export const ingredientUnitSchema = z.enum([
  'kg',
  'g',
  'l',
  'ml',
  'unit',
]);

export const createIngredientSchema = z.object({
  name: z.string().trim().min(1, 'Ingredient name is required'),
  description: z.string().trim().optional(),
  unit: ingredientUnitSchema,
  currentCost: z.number().min(0, 'Cost must be greater or equal to 0'),
});

export const updateIngredientSchema = createIngredientSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'At least one field must be provided',
  },
);