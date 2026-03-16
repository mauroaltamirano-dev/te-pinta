import { eq, ilike } from "drizzle-orm";

import { db } from "../../db/client";
import { categoriesTable, productsTable } from "../../db/schema";
import type {
  CreateProductInput,
  Product,
  ProductKind,
  UpdateProductInput,
} from "./products.types";

export type ProductWithCategory = {
  product: Product;
  categoryName: string | null;
};

function mapRowToProduct(row: typeof productsTable.$inferSelect): Product {
  return {
    id: row.id,
    categoryId: row.categoryId,
    name: row.name,
    description: row.description,
    kind: row.kind as ProductKind,
    unitPrice: row.unitPrice,
    halfDozenPrice: row.halfDozenPrice,
    dozenPrice: row.dozenPrice,
    directCost: row.directCost,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapJoinedRow(row: {
  products: typeof productsTable.$inferSelect;
  categories: typeof categoriesTable.$inferSelect | null;
}): ProductWithCategory {
  return {
    product: mapRowToProduct(row.products),
    categoryName: row.categories?.name ?? null,
  };
}

export const productsRepository = {
  async findAll(): Promise<ProductWithCategory[]> {
    const rows = await db
      .select()
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id));

    return rows.map(mapJoinedRow);
  },

  async findById(id: string): Promise<ProductWithCategory | null> {
    const [row] = await db
      .select()
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.id, id));

    return row ? mapJoinedRow(row) : null;
  },

  async findByName(name: string): Promise<Product | null> {
    const normalizedName = name.trim();

    const [row] = await db
      .select()
      .from(productsTable)
      .where(ilike(productsTable.name, normalizedName));

    return row ? mapRowToProduct(row) : null;
  },

  async create(input: CreateProductInput): Promise<ProductWithCategory> {
    const [row] = await db
      .insert(productsTable)
      .values({
        categoryId: input.categoryId,
        name: input.name.trim(),
        description: input.description?.trim() || null,
        kind: input.kind,
        unitPrice: input.unitPrice,
        halfDozenPrice: input.halfDozenPrice ?? null,
        dozenPrice: input.dozenPrice ?? null,
        directCost: input.directCost ?? null,
        isActive: true,
      })
      .returning();

    const [joinedRow] = await db
      .select()
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.id, row.id));

    return mapJoinedRow(joinedRow);
  },

  async update(
    id: string,
    input: UpdateProductInput,
  ): Promise<ProductWithCategory | null> {
    const values: Partial<typeof productsTable.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (input.categoryId !== undefined) {
      values.categoryId = input.categoryId;
    }

    if (input.name !== undefined) {
      values.name = input.name.trim();
    }

    if (input.description !== undefined) {
      values.description = input.description.trim() || null;
    }

    if (input.kind !== undefined) {
      values.kind = input.kind;
    }

    if (input.unitPrice !== undefined) {
      values.unitPrice = input.unitPrice;
    }

    if (input.halfDozenPrice !== undefined) {
      values.halfDozenPrice = input.halfDozenPrice ?? null;
    }

    if (input.dozenPrice !== undefined) {
      values.dozenPrice = input.dozenPrice ?? null;
    }

    if (input.directCost !== undefined) {
      values.directCost = input.directCost ?? null;
    }

    if (input.isActive !== undefined) {
      values.isActive = input.isActive;
    }

    const [row] = await db
      .update(productsTable)
      .set(values)
      .where(eq(productsTable.id, id))
      .returning();

    if (!row) {
      return null;
    }

    const [joinedRow] = await db
      .select()
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.id, row.id));

    return joinedRow ? mapJoinedRow(joinedRow) : null;
  },

  async deactivate(id: string): Promise<ProductWithCategory | null> {
    const [row] = await db
      .update(productsTable)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(productsTable.id, id))
      .returning();

    if (!row) {
      return null;
    }

    const [joinedRow] = await db
      .select()
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.id, row.id));

    return joinedRow ? mapJoinedRow(joinedRow) : null;
  },

  async reactivate(id: string): Promise<ProductWithCategory | null> {
    const [row] = await db
      .update(productsTable)
      .set({
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(productsTable.id, id))
      .returning();

    if (!row) {
      return null;
    }

    const [joinedRow] = await db
      .select()
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.id, row.id));

    return joinedRow ? mapJoinedRow(joinedRow) : null;
  },
};