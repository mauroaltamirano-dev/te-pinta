import { eq, ilike } from "drizzle-orm";

import { db } from "../../db/client";
import { categoriesTable } from "../../db/schema";
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./categories.types";

function mapRowToCategory(row: typeof categoriesTable.$inferSelect): Category {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const categoriesRepository = {
  async findAll(): Promise<Category[]> {
    const rows = await db.select().from(categoriesTable);

    return rows.map(mapRowToCategory);
  },

  async findById(id: string): Promise<Category | null> {
    const [row] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, id));

    return row ? mapRowToCategory(row) : null;
  },

  async findByName(name: string): Promise<Category | null> {
    const normalizedName = name.trim();

    const [row] = await db
      .select()
      .from(categoriesTable)
      .where(ilike(categoriesTable.name, normalizedName));

    return row ? mapRowToCategory(row) : null;
  },

  async create(input: CreateCategoryInput): Promise<Category> {
    const [row] = await db
      .insert(categoriesTable)
      .values({
        name: input.name.trim(),
        description: input.description?.trim() || null,
        isActive: true,
      })
      .returning();

    return mapRowToCategory(row);
  },

  async update(
    id: string,
    input: UpdateCategoryInput,
  ): Promise<Category | null> {
    const values: Partial<typeof categoriesTable.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) {
      values.name = input.name.trim();
    }

    if (input.description !== undefined) {
      values.description = input.description.trim() || null;
    }

    const [row] = await db
      .update(categoriesTable)
      .set(values)
      .where(eq(categoriesTable.id, id))
      .returning();

    return row ? mapRowToCategory(row) : null;
  },

  async deactivate(id: string): Promise<Category | null> {
    const [row] = await db
      .update(categoriesTable)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(categoriesTable.id, id))
      .returning();

    return row ? mapRowToCategory(row) : null;
  },
};