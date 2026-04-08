import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { purchasesTable } from '../../db/schema';
import type {
  CreatePurchaseInput,
  Purchase,
  UpdatePurchaseInput,
} from './purchases.types';

export const purchasesRepository = {
  async findAll(): Promise<Purchase[]> {
    const result = await db.select().from(purchasesTable).orderBy(purchasesTable.createdAt);
    return result.map((r: any) => ({
      ...r,
      type: r.type as any,
      unit: r.unit as any,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  },

  async findById(id: string): Promise<Purchase | null> {
    const [result] = await db
      .select()
      .from(purchasesTable)
      .where(eq(purchasesTable.id, id));

    if (!result) {
      return null;
    }

    return {
      ...result,
      type: result.type as any,
      unit: result.unit as any,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  },

  async create(input: CreatePurchaseInput): Promise<Purchase> {
    const [result] = await db
      .insert(purchasesTable)
      .values({
        date: input.date,
        type: input.type,
        ingredientId: input.ingredientId ?? null,
        nameSnapshot: input.nameSnapshot,
        quantity: input.quantity ?? null,
        unit: input.unit ?? null,
        unitPrice: input.unitPrice ?? null,
        totalAmount: input.totalAmount,
        supplier: input.supplier ?? null,
        notes: input.notes ?? null,
      })
      .returning();

    return {
      ...result,
      type: result.type as any,
      unit: result.unit as any,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  },

  async update(id: string, input: UpdatePurchaseInput): Promise<Purchase | null> {
    const updateData: any = { ...input };
    if (Object.keys(updateData).length === 0) return this.findById(id);
    updateData.updatedAt = new Date();

    const [result] = await db
      .update(purchasesTable)
      .set(updateData)
      .where(eq(purchasesTable.id, id))
      .returning();

    if (!result) {
      return null;
    }

    return {
      ...result,
      type: result.type as any,
      unit: result.unit as any,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  },

  async delete(id: string): Promise<boolean> {
    const [result] = await db
      .delete(purchasesTable)
      .where(eq(purchasesTable.id, id))
      .returning({ id: purchasesTable.id });

    return !!result;
  },
};