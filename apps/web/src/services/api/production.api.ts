import { apiClient } from "./client";

export type ProductionIngredientNeeded = {
  ingredientId: string;
  ingredientName: string;
  ingredientBaseUnit: "kg" | "g" | "l" | "ml" | "unit";
  requiredQuantityInBaseUnit: number;
};

export type ProductionIngredientsNeededResponse = {
  ordersConsidered: number;
  productsCalculated: number;
  items: ProductionIngredientNeeded[];
};

export function getIngredientsNeeded() {
  return apiClient.get<ProductionIngredientsNeededResponse>(
    "/production/ingredients-needed",
  );
}