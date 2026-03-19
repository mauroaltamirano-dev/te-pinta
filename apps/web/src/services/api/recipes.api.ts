import { apiClient } from "./client";

export type Recipe = {
  id: string;
  productId: string;
  yieldQuantity: number;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type RecipeItem = {
  id: string;
  recipeId: string;
  ingredientId: string;
  quantity: number;
  unit: "kg" | "g" | "l" | "ml" | "unit";
  createdAt: string;
  updatedAt: string;
};

export function getRecipes() {
  return apiClient.get<Recipe[]>("/recipes");
}

// ── nuevo ──────────────────────────────────────────────────────
export function getAllRecipeItems() {
  return apiClient.get<RecipeItem[]>("/recipes/items");
}

export function getRecipeByProductId(
  productId: string,
  options?: { includeInactive?: boolean },
) {
  return apiClient.get<Recipe>(`/recipes/product/${productId}`, {
    params: { includeInactive: options?.includeInactive },
  });
}

export function getRecipeItems(recipeId: string) {
  return apiClient.get<RecipeItem[]>(`/recipes/${recipeId}/items`);
}

export function createRecipe(data: {
  productId: string;
  yieldQuantity?: number;
  notes?: string;
}) {
  return apiClient.post<Recipe>("/recipes", data);
}

export function createRecipeItem(
  recipeId: string,
  data: {
    ingredientId: string;
    quantity: number;
    unit: "kg" | "g" | "l" | "ml" | "unit";
  },
) {
  return apiClient.post<RecipeItem>(`/recipes/${recipeId}/items`, data);
}

export function updateRecipe(
  recipeId: string,
  data: { yieldQuantity?: number; notes?: string },
) {
  return apiClient.patch<Recipe>(`/recipes/${recipeId}`, data);
}

export function deactivateRecipe(recipeId: string) {
  return apiClient.delete<Recipe>(`/recipes/${recipeId}`);
}

export function reactivateRecipe(recipeId: string) {
  return apiClient.patch<Recipe>(`/recipes/${recipeId}/reactivate`, {});
}

export function updateRecipeItem(
  recipeId: string,
  itemId: string,
  data: {
    ingredientId?: string;
    quantity?: number;
    unit?: "kg" | "g" | "l" | "ml" | "unit";
  },
) {
  return apiClient.patch<RecipeItem>(`/recipes/${recipeId}/items/${itemId}`, data);
}

export function deleteRecipeItem(recipeId: string, itemId: string) {
  return apiClient.delete<RecipeItem>(`/recipes/${recipeId}/items/${itemId}`);
}