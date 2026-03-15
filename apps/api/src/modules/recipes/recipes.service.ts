import { ingredientsRepository } from '../ingredients/ingredients.repository';
import { productsRepository } from '../products/products.repository';
import { recipesRepository } from './recipes.repository';
import type {
  CreateRecipeInput,
  CreateRecipeItemInput,
  UpdateRecipeInput,
  UpdateRecipeItemInput,
} from './recipes.types';

type ServiceError = {
  statusCode: number;
  message: string;
};

function createServiceError(statusCode: number, message: string): ServiceError {
  return { statusCode, message };
}

function getUnitGroup(unit: string) {
  if (unit === 'kg' || unit === 'g') return 'weight';
  if (unit === 'l' || unit === 'ml') return 'volume';
  if (unit === 'unit') return 'unit';

  return 'unknown';
}

function areUnitsCompatible(ingredientUnit: string, recipeUnit: string) {
  return getUnitGroup(ingredientUnit) === getUnitGroup(recipeUnit);
}

export const recipesService = {
  getAllRecipes() {
    return recipesRepository.findAllRecipes();
  },

  getRecipeById(id: string) {
    return recipesRepository.findRecipeById(id);
  },

  getRecipeByProductId(productId: string) {
    return recipesRepository.findRecipeByProductId(productId);
  },

  createRecipe(input: CreateRecipeInput) {
    const product = productsRepository.findById(input.productId);

    if (!product) {
      throw createServiceError(400, 'Product does not exist');
    }

    const existingRecipe = recipesRepository.findRecipeByProductId(input.productId);

    if (existingRecipe) {
      throw createServiceError(409, 'Product already has an active recipe');
    }

    return recipesRepository.createRecipe(input);
  },

  updateRecipe(id: string, input: UpdateRecipeInput) {
    const existingRecipe = recipesRepository.findRecipeById(id);

    if (!existingRecipe) {
      return null;
    }

    return recipesRepository.updateRecipe(id, input);
  },

  deactivateRecipe(id: string) {
    return recipesRepository.deactivateRecipe(id);
  },

  getRecipeItems(recipeId: string) {
    return recipesRepository.findItemsByRecipeId(recipeId);
  },

  createRecipeItem(recipeId: string, input: CreateRecipeItemInput) {
    const recipe = recipesRepository.findRecipeById(recipeId);

    if (!recipe || !recipe.isActive) {
      throw createServiceError(404, 'Recipe not found');
    }

    const ingredient = ingredientsRepository.findById(input.ingredientId);

    if (!ingredient) {
      throw createServiceError(400, 'Ingredient does not exist');
    }

    if (!areUnitsCompatible(ingredient.unit, input.unit)) {
      throw createServiceError(
        400,
        `Ingredient unit "${ingredient.unit}" is not compatible with recipe unit "${input.unit}"`,
      );
    }

    const existingItem = recipesRepository.findRecipeItemByIngredient(
      recipeId,
      input.ingredientId,
    );

    if (existingItem) {
      throw createServiceError(409, 'Ingredient already exists in this recipe');
    }

    return recipesRepository.createRecipeItem(recipeId, input);
  },

  updateRecipeItem(
    recipeId: string,
    itemId: string,
    input: UpdateRecipeItemInput,
  ) {
    const recipe = recipesRepository.findRecipeById(recipeId);

    if (!recipe || !recipe.isActive) {
      throw createServiceError(404, 'Recipe not found');
    }

    const existingItem = recipesRepository.findRecipeItemById(itemId);

    if (!existingItem || existingItem.recipeId !== recipeId) {
      return null;
    }

    const nextIngredientId = input.ingredientId ?? existingItem.ingredientId;
    const nextUnit = input.unit ?? existingItem.unit;

    const ingredient = ingredientsRepository.findById(nextIngredientId);

    if (!ingredient) {
      throw createServiceError(400, 'Ingredient does not exist');
    }

    if (!areUnitsCompatible(ingredient.unit, nextUnit)) {
      throw createServiceError(
        400,
        `Ingredient unit "${ingredient.unit}" is not compatible with recipe unit "${nextUnit}"`,
      );
    }

    const duplicatedItem = recipesRepository.findRecipeItemByIngredient(
      recipeId,
      nextIngredientId,
    );

    if (duplicatedItem && duplicatedItem.id !== itemId) {
      throw createServiceError(409, 'Ingredient already exists in this recipe');
    }

    return recipesRepository.updateRecipeItem(itemId, input);
  },

  deleteRecipeItem(recipeId: string, itemId: string) {
    const recipe = recipesRepository.findRecipeById(recipeId);

    if (!recipe || !recipe.isActive) {
      throw createServiceError(404, 'Recipe not found');
    }

    const existingItem = recipesRepository.findRecipeItemById(itemId);

    if (!existingItem || existingItem.recipeId !== recipeId) {
      return null;
    }

    return recipesRepository.deleteRecipeItem(itemId);
  },
};