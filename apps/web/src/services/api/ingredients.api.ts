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

export function getIngredients(options?: { includeInactive?: boolean }) {
  return apiClient.get<Ingredient[]>("/ingredients", {
    params: { includeInactive: options?.includeInactive },
  });
}

export function createIngredient(data: {
  name: string;
  description?: string;
  unit: IngredientUnit;
  currentCost: number;
}) {
  return apiClient.post<Ingredient>("/ingredients", data);
}

export function updateIngredient(
  id: string,
  data: {
    name?: string;
    description?: string;
    unit?: IngredientUnit;
    currentCost?: number;
  },
) {
  return apiClient.patch<Ingredient>(`/ingredients/${id}`, data);
}

export function deactivateIngredient(id: string) {
  return apiClient.delete(`/ingredients/${id}`);
}