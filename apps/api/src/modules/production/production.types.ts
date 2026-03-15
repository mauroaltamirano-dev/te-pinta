export type ProductionRequirementInput = {
  quantity: number;
};

export type ProductionRequirementsBatchInput = {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
};

export type CostBreakdownItem = {
  ingredientId: string;
  ingredientName: string;
  ingredientBaseUnit: 'kg' | 'g' | 'l' | 'ml' | 'unit';
  recipeUnit: 'kg' | 'g' | 'l' | 'ml' | 'unit';
  recipeQuantity: number;
  normalizedQuantityInBaseUnit: number;
  ingredientCurrentCost: number;
  ingredientCostPerBaseUnit: number;
  totalCost: number;
};

export type RequirementItem = {
  ingredientId: string;
  ingredientName: string;
  ingredientBaseUnit: 'kg' | 'g' | 'l' | 'ml' | 'unit';
  requiredQuantityInBaseUnit: number;
};

export type IngredientsNeededItem = {
  ingredientId: string;
  ingredientName: string;
  ingredientBaseUnit: 'kg' | 'g' | 'l' | 'ml' | 'unit';
  requiredQuantityInBaseUnit: number;
};

export type IngredientsNeededResponse = {
  ordersConsidered: number;
  productsCalculated: number;
  items: IngredientsNeededItem[];
};