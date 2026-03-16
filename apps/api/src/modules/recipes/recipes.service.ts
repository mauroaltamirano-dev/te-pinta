import { ingredientsRepository } from '../ingredients/ingredients.repository';
import { productsRepository } from '../products/products.repository';
import { recipesRepository } from './recipes.repository';
import type {
  CreateRecipeInput,
  CreateRecipeItemInput,
  Recipe,
  RecipeItem,
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
  async getAllRecipes(): Promise<Recipe[]> {
    return await recipesRepository.findAllRecipes();
  },

  async getRecipeById(id: string): Promise<Recipe | null> {
    return await recipesRepository.findRecipeById(id);
  },

  async getRecipeByProductId(productId: string): Promise<Recipe | null> {
    return await recipesRepository.findRecipeByProductId(productId);
  },

  async createRecipe(input: CreateRecipeInput): Promise<Recipe> {
    const product = await productsRepository.findById(input.productId);

    if (!product) {
      throw createServiceError(400, 'Product does not exist');
    }

    const existingRecipe = await recipesRepository.findRecipeByProductId(input.productId);

    if (existingRecipe) {
      throw createServiceError(409, 'Product already has an active recipe');
    }

    return await recipesRepository.createRecipe(input);
  },

  async updateRecipe(id: string, input: UpdateRecipeInput): Promise<Recipe | null> {
    const existingRecipe = await recipesRepository.findRecipeById(id);

    if (!existingRecipe) {
      return null;
    }

    return await recipesRepository.updateRecipe(id, input);
  },

  async deactivateRecipe(id: string): Promise<Recipe | null> {
    return await recipesRepository.deactivateRecipe(id);
  },

  async getRecipeItems(recipeId: string): Promise<RecipeItem[]> {
    return await recipesRepository.findItemsByRecipeId(recipeId);
  },

  async createRecipeItem(recipeId: string, input: CreateRecipeItemInput): Promise<RecipeItem> {
    const recipe = await recipesRepository.findRecipeById(recipeId);

    if (!recipe || !recipe.isActive) {
      throw createServiceError(404, 'Recipe not found');
    }

    const ingredient = await ingredientsRepository.findById(input.ingredientId);

    if (!ingredient) {
      throw createServiceError(400, 'Ingredient does not exist');
    }

    if (!areUnitsCompatible(ingredient.unit, input.unit)) {
      throw createServiceError(
        400,
        `Ingredient unit "${ingredient.unit}" is not compatible with recipe unit "${input.unit}"`,
      );
    }

    const existingItem = await recipesRepository.findRecipeItemByIngredient(
      recipeId,
      input.ingredientId,
    );

    if (existingItem) {
      throw createServiceError(409, 'Ingredient already exists in this recipe');
    }

    return await recipesRepository.createRecipeItem(recipeId, input);
  },

  async updateRecipeItem(
    recipeId: string,
    itemId: string,
    input: UpdateRecipeItemInput,
  ): Promise<RecipeItem | null> {
    const recipe = await recipesRepository.findRecipeById(recipeId);

    if (!recipe || !recipe.isActive) {
      throw createServiceError(404, 'Recipe not found');
    }

    const existingItem = await recipesRepository.findRecipeItemById(itemId);

    if (!existingItem || existingItem.recipeId !== recipeId) {
      return null;
    }

    const nextIngredientId = input.ingredientId ?? existingItem.ingredientId;
    const nextUnit = input.unit ?? existingItem.unit;

    const ingredient = await ingredientsRepository.findById(nextIngredientId);

    if (!ingredient) {
      throw createServiceError(400, 'Ingredient does not exist');
    }

    if (!areUnitsCompatible(ingredient.unit, nextUnit)) {
      throw createServiceError(
        400,
        `Ingredient unit "${ingredient.unit}" is not compatible with recipe unit "${nextUnit}"`,
      );
    }

    const duplicatedItem = await recipesRepository.findRecipeItemByIngredient(
      recipeId,
      nextIngredientId,
    );

    if (duplicatedItem && duplicatedItem.id !== itemId) {
      throw createServiceError(409, 'Ingredient already exists in this recipe');
    }

    return await recipesRepository.updateRecipeItem(itemId, input);
  },

  async deleteRecipeItem(recipeId: string, itemId: string): Promise<RecipeItem | null> {
    const recipe = await recipesRepository.findRecipeById(recipeId);

    if (!recipe || !recipe.isActive) {
      throw createServiceError(404, 'Recipe not found');
    }

    const existingItem = await recipesRepository.findRecipeItemById(itemId);

    if (!existingItem || existingItem.recipeId !== recipeId) {
      return null;
    }

    return await recipesRepository.deleteRecipeItem(itemId);
  },
};