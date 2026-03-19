import { and, eq } from 'drizzle-orm';

import { db } from '../../db/client';
import { recipeItemsTable, recipesTable } from '../../db/schema';
import type {
  CreateRecipeInput,
  CreateRecipeItemInput,
  Recipe,
  RecipeItem,
  RecipeUnit,
  UpdateRecipeInput,
  UpdateRecipeItemInput,
} from './recipes.types';

function mapRowToRecipe(row: typeof recipesTable.$inferSelect): Recipe {
  return {
    id: row.id,
    productId: row.productId,
    yieldQuantity: row.yieldQuantity,
    notes: row.notes,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapRowToRecipeItem(row: typeof recipeItemsTable.$inferSelect): RecipeItem {
  return {
    id: row.id,
    recipeId: row.recipeId,
    ingredientId: row.ingredientId,
    quantity: row.quantity,
    unit: row.unit as RecipeUnit,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const recipesRepository = {
  async findAllRecipes(): Promise<Recipe[]> {
    const rows = await db.select().from(recipesTable);
    return rows.map(mapRowToRecipe);
  },

  // ── nuevo ────────────────────────────────────────────────────
  async findAllRecipeItems(): Promise<RecipeItem[]> {
    const rows = await db.select().from(recipeItemsTable);
    return rows.map(mapRowToRecipeItem);
  },

  async findRecipeById(id: string): Promise<Recipe | null> {
    const [row] = await db
      .select()
      .from(recipesTable)
      .where(eq(recipesTable.id, id));

    return row ? mapRowToRecipe(row) : null;
  },

  async findRecipeByProductId(
    productId: string,
    options?: { includeInactive?: boolean },
  ): Promise<Recipe | null> {
    const includeInactive = options?.includeInactive ?? false;

    const [row] = await db
      .select()
      .from(recipesTable)
      .where(
        includeInactive
          ? eq(recipesTable.productId, productId)
          : and(
              eq(recipesTable.productId, productId),
              eq(recipesTable.isActive, true),
            ),
      );

    return row ? mapRowToRecipe(row) : null;
  },

  async createRecipe(input: CreateRecipeInput): Promise<Recipe> {
    const [row] = await db
      .insert(recipesTable)
      .values({
        productId: input.productId,
        yieldQuantity: input.yieldQuantity ?? 1,
        notes: input.notes || null,
        isActive: true,
      })
      .returning();

    return mapRowToRecipe(row);
  },

  async updateRecipe(id: string, input: UpdateRecipeInput): Promise<Recipe | null> {
    const [row] = await db
      .update(recipesTable)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(recipesTable.id, id))
      .returning();

    return row ? mapRowToRecipe(row) : null;
  },

  async deactivateRecipe(id: string): Promise<Recipe | null> {
    const [row] = await db
      .update(recipesTable)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(recipesTable.id, id))
      .returning();

    return row ? mapRowToRecipe(row) : null;
  },

  async reactivateRecipe(id: string): Promise<Recipe | null> {
    const [row] = await db
      .update(recipesTable)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(recipesTable.id, id))
      .returning();

    return row ? mapRowToRecipe(row) : null;
  },

  async findItemsByRecipeId(recipeId: string): Promise<RecipeItem[]> {
    const rows = await db
      .select()
      .from(recipeItemsTable)
      .where(eq(recipeItemsTable.recipeId, recipeId));

    return rows.map(mapRowToRecipeItem);
  },

  async findRecipeItemById(itemId: string): Promise<RecipeItem | null> {
    const [row] = await db
      .select()
      .from(recipeItemsTable)
      .where(eq(recipeItemsTable.id, itemId));

    return row ? mapRowToRecipeItem(row) : null;
  },

  async findRecipeItemByIngredient(
    recipeId: string,
    ingredientId: string,
  ): Promise<RecipeItem | null> {
    const [row] = await db
      .select()
      .from(recipeItemsTable)
      .where(
        and(
          eq(recipeItemsTable.recipeId, recipeId),
          eq(recipeItemsTable.ingredientId, ingredientId),
        ),
      );

    return row ? mapRowToRecipeItem(row) : null;
  },

  async createRecipeItem(recipeId: string, input: CreateRecipeItemInput): Promise<RecipeItem> {
    const [row] = await db
      .insert(recipeItemsTable)
      .values({
        recipeId,
        ingredientId: input.ingredientId,
        quantity: input.quantity,
        unit: input.unit,
      })
      .returning();

    return mapRowToRecipeItem(row);
  },

  async updateRecipeItem(
    itemId: string,
    input: UpdateRecipeItemInput,
  ): Promise<RecipeItem | null> {
    const [row] = await db
      .update(recipeItemsTable)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(recipeItemsTable.id, itemId))
      .returning();

    return row ? mapRowToRecipeItem(row) : null;
  },

  async deleteRecipeItem(itemId: string): Promise<RecipeItem | null> {
    const [row] = await db
      .delete(recipeItemsTable)
      .where(eq(recipeItemsTable.id, itemId))
      .returning();

    return row ? mapRowToRecipeItem(row) : null;
  },
};