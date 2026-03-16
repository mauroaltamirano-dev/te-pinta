import type { Ingredient } from "./ingredients.types";

export const ingredientsMapper = {
  toResponse(ingredient: Ingredient) {
    return {
      id: ingredient.id,
      name: ingredient.name,
      description: ingredient.description,
      unit: ingredient.unit,
      currentCost: ingredient.currentCost,
      isActive: ingredient.isActive,
      createdAt: ingredient.createdAt.toISOString(),
      updatedAt: ingredient.updatedAt.toISOString(),
    };
  },

  toResponseList(ingredients: Ingredient[]) {
    return ingredients.map((ingredient) => this.toResponse(ingredient));
  },
};