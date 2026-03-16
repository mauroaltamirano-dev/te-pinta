import { eq, ilike } from "drizzle-orm";

import { db } from "../../db/client";
import { ingredientsTable } from "../../db/schema";
import type {
  Ingredient,
  CreateIngredientInput,
  UpdateIngredientInput,
  IngredientUnit,
} from "./ingredients.types";

function mapRowToIngredient(
  row: typeof ingredientsTable.$inferSelect,
): Ingredient {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    unit: row.unit as IngredientUnit,
    currentCost: row.currentCost,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const ingredientsRepository = {
  async findAll(): Promise<Ingredient[]> {
    const rows = await db.select().from(ingredientsTable);

    return rows.map(mapRowToIngredient);
  },

  async findById(id: string): Promise<Ingredient | null> {
    const [row] = await db
      .select()
      .from(ingredientsTable)
      .where(eq(ingredientsTable.id, id));

    return row ? mapRowToIngredient(row) : null;
  },

  async findByName(name: string): Promise<Ingredient | null> {
    const normalizedName = name.trim();

    const [row] = await db
      .select()
      .from(ingredientsTable)
      .where(ilike(ingredientsTable.name, normalizedName));

    return row ? mapRowToIngredient(row) : null;
  },

  async create(input: CreateIngredientInput): Promise<Ingredient> {
    const [row] = await db
      .insert(ingredientsTable)
      .values({
        name: input.name.trim(),
        description: input.description?.trim() || null,
        unit: input.unit,
        currentCost: input.currentCost,
        isActive: true,
      })
      .returning();

    return mapRowToIngredient(row);
  },

  async update(
    id: string,
    input: UpdateIngredientInput,
  ): Promise<Ingredient | null> {
    const values: Partial<typeof ingredientsTable.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) {
      values.name = input.name.trim();
    }

    if (input.description !== undefined) {
      values.description = input.description.trim() || null;
    }

    if (input.unit !== undefined) {
      values.unit = input.unit;
    }

    if (input.currentCost !== undefined) {
      values.currentCost = input.currentCost;
    }

    const [row] = await db
      .update(ingredientsTable)
      .set(values)
      .where(eq(ingredientsTable.id, id))
      .returning();

    return row ? mapRowToIngredient(row) : null;
  },

  async deactivate(id: string): Promise<Ingredient | null> {
    const [row] = await db
      .update(ingredientsTable)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(ingredientsTable.id, id))
      .returning();

    return row ? mapRowToIngredient(row) : null;
  },
};