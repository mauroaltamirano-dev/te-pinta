import type { Recipe, RecipeItem } from './recipes.types';

export const recipesMapper = {
  toRecipeResponse(recipe: Recipe) {
    return {
      id: recipe.id,
      productId: recipe.productId,
      yieldQuantity: recipe.yieldQuantity,
      notes: recipe.notes,
      isActive: recipe.isActive,
      createdAt: recipe.createdAt.toISOString(),
      updatedAt: recipe.updatedAt.toISOString(),
    };
  },

  toRecipeListResponse(recipes: Recipe[]) {
    return recipes.map((recipe) => this.toRecipeResponse(recipe));
  },

  toRecipeItemResponse(item: RecipeItem) {
    return {
      id: item.id,
      recipeId: item.recipeId,
      ingredientId: item.ingredientId,
      quantity: item.quantity,
      unit: item.unit,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  },

  toRecipeItemListResponse(items: RecipeItem[]) {
    return items.map((item) => this.toRecipeItemResponse(item));
  },
};