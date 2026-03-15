import type {
  CreateRecipeInput,
  CreateRecipeItemInput,
  Recipe,
  RecipeItem,
  UpdateRecipeInput,
  UpdateRecipeItemInput,
} from './recipes.types';

const recipes = new Map<string, Recipe>();
const recipeItems = new Map<string, RecipeItem>();

function generateRecipeId() {
  return crypto.randomUUID();
}

function generateRecipeItemId() {
  return crypto.randomUUID();
}

export const recipesRepository = {
  findAllRecipes(): Recipe[] {
    return Array.from(recipes.values());
  },

  findRecipeById(id: string): Recipe | null {
    return recipes.get(id) ?? null;
  },

  findRecipeByProductId(productId: string): Recipe | null {
    for (const recipe of recipes.values()) {
      if (recipe.productId === productId && recipe.isActive) {
        return recipe;
      }
    }

    return null;
  },

  createRecipe(input: CreateRecipeInput): Recipe {
    const now = new Date().toISOString();

    const recipe: Recipe = {
      id: generateRecipeId(),
      productId: input.productId,
      yieldQuantity: input.yieldQuantity ?? 1,
      notes: input.notes || null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    recipes.set(recipe.id, recipe);

    return recipe;
  },

  updateRecipe(id: string, input: UpdateRecipeInput): Recipe | null {
    const existing = recipes.get(id);

    if (!existing) {
      return null;
    }

    const updated: Recipe = {
      ...existing,
      yieldQuantity: input.yieldQuantity ?? existing.yieldQuantity,
      notes: input.notes ?? existing.notes,
      updatedAt: new Date().toISOString(),
    };

    recipes.set(id, updated);

    return updated;
  },

  deactivateRecipe(id: string): Recipe | null {
    const existing = recipes.get(id);

    if (!existing) {
      return null;
    }

    const updated: Recipe = {
      ...existing,
      isActive: false,
      updatedAt: new Date().toISOString(),
    };

    recipes.set(id, updated);

    return updated;
  },

  findItemsByRecipeId(recipeId: string): RecipeItem[] {
    return Array.from(recipeItems.values()).filter((item) => item.recipeId === recipeId);
  },

  findRecipeItemById(itemId: string): RecipeItem | null {
    return recipeItems.get(itemId) ?? null;
  },

  findRecipeItemByIngredient(recipeId: string, ingredientId: string): RecipeItem | null {
    for (const item of recipeItems.values()) {
      if (item.recipeId === recipeId && item.ingredientId === ingredientId) {
        return item;
      }
    }

    return null;
  },

  createRecipeItem(recipeId: string, input: CreateRecipeItemInput): RecipeItem {
    const now = new Date().toISOString();

    const item: RecipeItem = {
      id: generateRecipeItemId(),
      recipeId,
      ingredientId: input.ingredientId,
      quantity: input.quantity,
      unit: input.unit,
      createdAt: now,
      updatedAt: now,
    };

    recipeItems.set(item.id, item);

    return item;
  },

  updateRecipeItem(itemId: string, input: UpdateRecipeItemInput): RecipeItem | null {
    const existing = recipeItems.get(itemId);

    if (!existing) {
      return null;
    }

    const updated: RecipeItem = {
      ...existing,
      ingredientId: input.ingredientId ?? existing.ingredientId,
      quantity: input.quantity ?? existing.quantity,
      unit: input.unit ?? existing.unit,
      updatedAt: new Date().toISOString(),
    };

    recipeItems.set(itemId, updated);

    return updated;
  },

  deleteRecipeItem(itemId: string): RecipeItem | null {
    const existing = recipeItems.get(itemId);

    if (!existing) {
      return null;
    }

    recipeItems.delete(itemId);

    return existing;
  },
};