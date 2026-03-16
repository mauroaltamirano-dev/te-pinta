export type RecipeUnit = 'kg' | 'g' | 'l' | 'ml' | 'unit';

export type Recipe = {
  id: string;
  productId: string;
  yieldQuantity: number;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type RecipeItem = {
  id: string;
  recipeId: string;
  ingredientId: string;
  quantity: number;
  unit: RecipeUnit;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateRecipeInput = {
  productId: string;
  yieldQuantity?: number;
  notes?: string;
};

export type UpdateRecipeInput = Partial<{
  yieldQuantity: number;
  notes: string;
}>;

export type CreateRecipeItemInput = {
  ingredientId: string;
  quantity: number;
  unit: RecipeUnit;
};

export type UpdateRecipeItemInput = Partial<CreateRecipeItemInput>;