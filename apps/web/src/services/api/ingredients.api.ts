import { apiClient } from "./client";

export type IngredientUnit = "kg" | "g" | "l" | "ml" | "unit";

export type Ingredient = {
  id: string;
  name: string;
  description: string | null;
  unit: IngredientUnit;
  currentCost: number;
  isActive: boolean;
};

export function getIngredients() {
  return apiClient.get<Ingredient[]>("/ingredients");
}

export function createIngredient(data: {
  name: string;
  description?: string;
  unit: IngredientUnit;
  currentCost: number;
}) {
  return apiClient.post<Ingredient>("/ingredients", data);
}