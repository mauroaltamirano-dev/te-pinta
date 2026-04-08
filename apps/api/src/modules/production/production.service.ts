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

async function getRecipeForProduct(productId: string) {
  const productResult = await productsRepository.findById(productId);

  if (!productResult) {
    throw createServiceError(404, 'Product not found');
  }

  const recipe = await recipesRepository.findRecipeByProductId(productId);

  if (!recipe || !recipe.isActive) {
    throw createServiceError(404, 'Active recipe not found for product');
  }

  return {
    product: productResult.product,
    recipe,
  };
}

async function buildCostBreakdown(productId: string): Promise<{
  product: Awaited<ReturnType<typeof getRecipeForProduct>>['product'];
  recipeId: string;
  yieldQuantity: number;
  items: CostBreakdownItem[];
  totalUnitCost: number;
}> {
  const { product, recipe } = await getRecipeForProduct(productId);
  const recipeItems = await recipesRepository.findItemsByRecipeId(recipe.id);

  if (recipeItems.length === 0) {
    throw createServiceError(400, 'Recipe has no items');
  }

  const items: CostBreakdownItem[] = [];

  for (const recipeItem of recipeItems) {
    const ingredient = await ingredientsRepository.findById(recipeItem.ingredientId);

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

    items.push({
      ingredientId: ingredient.id,
      ingredientName: ingredient.name,
      ingredientBaseUnit: ingredient.unit,
      recipeUnit: recipeItem.unit,
      recipeQuantity: recipeItem.quantity,
      normalizedQuantityInBaseUnit,
      ingredientCurrentCost: ingredient.currentCost,
      ingredientCostPerBaseUnit,
      totalCost,
    });
  }

  const totalRecipeCost = items.reduce((sum, item) => sum + item.totalCost, 0);
  const totalUnitCost = totalRecipeCost / recipe.yieldQuantity;

  return {
    product,
    recipeId: recipe.id,
    yieldQuantity: recipe.yieldQuantity,
    items,
    totalUnitCost,
  };
}

async function buildRequirementsForProduct(productId: string, quantity: number): Promise<{
  product: Awaited<ReturnType<typeof getRecipeForProduct>>['product'];
  recipeId: string;
  requestedQuantity: number;
  items: RequirementItem[];
}> {
  const { product, recipe } = await getRecipeForProduct(productId);
  const recipeItems = await recipesRepository.findItemsByRecipeId(recipe.id);

  if (recipeItems.length === 0) {
    throw createServiceError(400, 'Recipe has no items');
  }

  const items: RequirementItem[] = [];

  for (const recipeItem of recipeItems) {
    const ingredient = await ingredientsRepository.findById(recipeItem.ingredientId);

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

    items.push({
      ingredientId: ingredient.id,
      ingredientName: ingredient.name,
      ingredientBaseUnit: ingredient.unit,
      requiredQuantityInBaseUnit,
    });
  }

  return {
    product,
    recipeId: recipe.id,
    requestedQuantity: quantity,
    items,
  };
}

export const productionService = {
  async getProductCost(productId: string) {
    return await buildCostBreakdown(productId);
  },

  async getProductRequirements(productId: string, input: ProductionRequirementInput) {
    return await buildRequirementsForProduct(productId, input.quantity);
  },

  async getIngredientsNeededFromOrders() {
    const consolidated = new Map<string, RequirementItem>();
    
    const activeOrders = await ordersRepository.findOrdersByStatuses(['pending', 'confirmed']);

    if (activeOrders.length === 0) {
      return {
        ordersConsidered: 0,
        productsCalculated: 0,
        items: [],
      };
    }

    const orderIds = activeOrders.map((o) => o.id);
    const allOrderItems = await ordersRepository.findItemsByOrderIds(orderIds);

    const productQuantities = new Map<string, number>();
    for (const item of allOrderItems) {
      productQuantities.set(
        item.productId,
        (productQuantities.get(item.productId) || 0) + item.quantity,
      );
    }

    let productsCalculated = 0;

    for (const [productId, quantity] of productQuantities.entries()) {
      try {
        const result = await buildRequirementsForProduct(productId, quantity);
        productsCalculated += quantity;

        for (const requirement of result.items) {
          const existing = consolidated.get(requirement.ingredientId);

          if (!existing) {
            consolidated.set(requirement.ingredientId, { ...requirement });
            continue;
          }

          consolidated.set(requirement.ingredientId, {
            ...existing,
            requiredQuantityInBaseUnit:
              existing.requiredQuantityInBaseUnit + requirement.requiredQuantityInBaseUnit,
          });
        }
      } catch (e) {
        continue;
      }
    }

    return {
      ordersConsidered: activeOrders.length,
      productsCalculated,
      items: Array.from(consolidated.values()),
    };
  },

  async getBatchRequirements(input: ProductionRequirementsBatchInput) {
    const consolidated = new Map<string, RequirementItem>();

    const productQuantities = new Map<string, number>();
    for (const item of input.items) {
      productQuantities.set(
        item.productId,
        (productQuantities.get(item.productId) || 0) + item.quantity,
      );
    }

    for (const [productId, quantity] of productQuantities.entries()) {
      const result = await buildRequirementsForProduct(productId, quantity);

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