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

export function getRecipeByProductId(productId: string) {
  return apiClient.get<Recipe>(`/recipes/product/${productId}`);
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