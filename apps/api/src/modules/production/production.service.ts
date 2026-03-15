import { ingredientsRepository } from '../ingredients/ingredients.repository';
import { productsRepository } from '../products/products.repository';
import { recipesRepository } from '../recipes/recipes.repository';
import { ordersRepository } from '../orders/orders.repository';
import type {
  ProductionRequirementInput,
  ProductionRequirementsBatchInput,
  CostBreakdownItem,
  RequirementItem,
} from './production.types';

type ServiceError = {
  statusCode: number;
  message: string;
};

function createServiceError(statusCode: number, message: string): ServiceError {
  return { statusCode, message };
}

function convertToBaseUnit(quantity: number, fromUnit: string, baseUnit: string) {
  if (fromUnit === baseUnit) {
    return quantity;
  }

  if (fromUnit === 'g' && baseUnit === 'kg') {
    return quantity / 1000;
  }

  if (fromUnit === 'kg' && baseUnit === 'g') {
    return quantity * 1000;
  }

  if (fromUnit === 'ml' && baseUnit === 'l') {
    return quantity / 1000;
  }

  if (fromUnit === 'l' && baseUnit === 'ml') {
    return quantity * 1000;
  }

  throw createServiceError(
    400,
    `Cannot convert recipe unit "${fromUnit}" to ingredient base unit "${baseUnit}"`,
  );
}

function getRecipeForProduct(productId: string) {
  const product = productsRepository.findById(productId);

  if (!product) {
    throw createServiceError(404, 'Product not found');
  }

  const recipe = recipesRepository.findRecipeByProductId(productId);

  if (!recipe || !recipe.isActive) {
    throw createServiceError(404, 'Active recipe not found for product');
  }

  return { product, recipe };
}

function buildCostBreakdown(productId: string): {
  product: ReturnType<typeof productsRepository.findById>;
  recipeId: string;
  yieldQuantity: number;
  items: CostBreakdownItem[];
  totalUnitCost: number;
} {
  const { product, recipe } = getRecipeForProduct(productId);
  const recipeItems = recipesRepository.findItemsByRecipeId(recipe.id);

  if (recipeItems.length === 0) {
    throw createServiceError(400, 'Recipe has no items');
  }

  const items: CostBreakdownItem[] = recipeItems.map((recipeItem) => {
    const ingredient = ingredientsRepository.findById(recipeItem.ingredientId);

    if (!ingredient) {
      throw createServiceError(400, `Ingredient ${recipeItem.ingredientId} not found`);
    }

    const normalizedQuantityInBaseUnit = convertToBaseUnit(
      recipeItem.quantity,
      recipeItem.unit,
      ingredient.unit,
    );

    const ingredientCostPerBaseUnit = ingredient.currentCost;
    const totalCost = normalizedQuantityInBaseUnit * ingredientCostPerBaseUnit;

    return {
      ingredientId: ingredient.id,
      ingredientName: ingredient.name,
      ingredientBaseUnit: ingredient.unit,
      recipeUnit: recipeItem.unit,
      recipeQuantity: recipeItem.quantity,
      normalizedQuantityInBaseUnit,
      ingredientCurrentCost: ingredient.currentCost,
      ingredientCostPerBaseUnit,
      totalCost,
    };
  });

  const totalUnitCost = items.reduce((sum, item) => sum + item.totalCost, 0);

  return {
    product,
    recipeId: recipe.id,
    yieldQuantity: recipe.yieldQuantity,
    items,
    totalUnitCost,
  };
}

function buildRequirementsForProduct(productId: string, quantity: number): {
  product: ReturnType<typeof productsRepository.findById>;
  recipeId: string;
  requestedQuantity: number;
  items: RequirementItem[];
} {
  const { product, recipe } = getRecipeForProduct(productId);
  const recipeItems = recipesRepository.findItemsByRecipeId(recipe.id);

  if (recipeItems.length === 0) {
    throw createServiceError(400, 'Recipe has no items');
  }

  const items: RequirementItem[] = recipeItems.map((recipeItem) => {
    const ingredient = ingredientsRepository.findById(recipeItem.ingredientId);

    if (!ingredient) {
      throw createServiceError(400, `Ingredient ${recipeItem.ingredientId} not found`);
    }

    const normalizedPerUnit = convertToBaseUnit(
      recipeItem.quantity,
      recipeItem.unit,
      ingredient.unit,
    );

    const requiredQuantityInBaseUnit =
      (normalizedPerUnit * quantity) / recipe.yieldQuantity;

    return {
      ingredientId: ingredient.id,
      ingredientName: ingredient.name,
      ingredientBaseUnit: ingredient.unit,
      requiredQuantityInBaseUnit,
    };
  });

  return {
    product,
    recipeId: recipe.id,
    requestedQuantity: quantity,
    items,
  };
}



export const productionService = {
  getProductCost(productId: string) {
    return buildCostBreakdown(productId);
  },

  getProductRequirements(productId: string, input: ProductionRequirementInput) {
    return buildRequirementsForProduct(productId, input.quantity);
  },

  getIngredientsNeededFromOrders() {
    const consolidated = new Map<string, RequirementItem>();
    const activeOrders = ordersRepository.findAllOrders().filter((order) =>
      order.isActive &&
      (order.status === 'pending' || order.status === 'confirmed'),
    );

    let productsCalculated = 0;

    for (const order of activeOrders) {
      const orderItems = ordersRepository.findItemsByOrderId(order.id);

      for (const orderItem of orderItems) {
        let result: ReturnType<typeof buildRequirementsForProduct>;

        try {
          result = buildRequirementsForProduct(
            orderItem.productId,
            orderItem.quantity,
          );
        } catch {
          // Skip products without an active recipe
          continue;
        }

        productsCalculated += orderItem.quantity;

        for (const requirement of result.items) {
          const existing = consolidated.get(requirement.ingredientId);

          if (!existing) {
            consolidated.set(requirement.ingredientId, { ...requirement });
            continue;
          }

          consolidated.set(requirement.ingredientId, {
            ...existing,
            requiredQuantityInBaseUnit:
              existing.requiredQuantityInBaseUnit +
              requirement.requiredQuantityInBaseUnit,
          });
        }
      }
    }

    return {
      ordersConsidered: activeOrders.length,
      productsCalculated,
      items: Array.from(consolidated.values()),
    };
  },

  getBatchRequirements(input: ProductionRequirementsBatchInput) {
    const consolidated = new Map<string, RequirementItem>();

    for (const item of input.items) {
      const result = buildRequirementsForProduct(item.productId, item.quantity);

      for (const requirement of result.items) {
        const existing = consolidated.get(requirement.ingredientId);

        if (!existing) {
          consolidated.set(requirement.ingredientId, { ...requirement });
          continue;
        }

        consolidated.set(requirement.ingredientId, {
          ...existing,
          requiredQuantityInBaseUnit:
            existing.requiredQuantityInBaseUnit +
            requirement.requiredQuantityInBaseUnit,
        });
      }
    }

    return {
      items: Array.from(consolidated.values()),
    };
  },
};