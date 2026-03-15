import type { z } from 'zod';

import type {
  createIngredientSchema,
  updateIngredientSchema,
  ingredientUnitSchema,
} from './ingredients.schema';

export type IngredientUnit = z.infer<typeof ingredientUnitSchema>;

export type Ingredient = {
  id: string;
  name: string;
  description: string | null;
  unit: IngredientUnit;
  currentCost: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateIngredientInput = z.infer<typeof createIngredientSchema>;
export type UpdateIngredientInput = z.infer<typeof updateIngredientSchema>;