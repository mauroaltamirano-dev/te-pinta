import { desc, eq, and, gte, lte } from "drizzle-orm";
import { db } from "../../db/client";
import { weeklyClosuresTable } from "../../db/schema";
import type { WeeklyClosure, CreateWeeklyClosureInput } from "./weekly-closures.types";

function mapRowToWeeklyClosure(row: typeof weeklyClosuresTable.$inferSelect): WeeklyClosure {
  return {
    id: row.id,
    name: row.name,
    startDate: row.startDate,
    endDate: row.endDate,
    status: row.status as WeeklyClosure["status"],
    notes: row.notes,
    snapshot: row.snapshot,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    closedAt: row.closedAt,
  };
}

export const weeklyClosuresRepository = {
  async findAll(): Promise<WeeklyClosure[]> {
    const rows = await db
      .select()
      .from(weeklyClosuresTable)
      .orderBy(desc(weeklyClosuresTable.createdAt));
    return rows.map(mapRowToWeeklyClosure);
  },

  async findById(id: string): Promise<WeeklyClosure | null> {
    const [row] = await db
      .select()
      .from(weeklyClosuresTable)
      .where(eq(weeklyClosuresTable.id, id));
    return row ? mapRowToWeeklyClosure(row) : null;
  },

  async findOpenClosure(): Promise<WeeklyClosure | null> {
    const [row] = await db
      .select()
      .from(weeklyClosuresTable)
      .where(eq(weeklyClosuresTable.status, "open"));
    return row ? mapRowToWeeklyClosure(row) : null;
  },

  async create(data: CreateWeeklyClosureInput): Promise<WeeklyClosure> {
    const [row] = await db
      .insert(weeklyClosuresTable)
      .values({
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        notes: data.notes,
        status: "open",
      })
      .returning();
    return mapRowToWeeklyClosure(row);
  },

  async close(id: string, snapshot: string): Promise<WeeklyClosure | null> {
    const [row] = await db
      .update(weeklyClosuresTable)
      .set({
        status: "closed",
        snapshot,
        closedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(weeklyClosuresTable.id, id))
      .returning();
    return row ? mapRowToWeeklyClosure(row) : null;
  },

  async update(id: string, data: Partial<WeeklyClosure>): Promise<WeeklyClosure | null> {
    const updateData: any = { ...data };
    updateData.updatedAt = new Date();
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
    if (updateData.closedAt) updateData.closedAt = new Date(updateData.closedAt);
    
    const [row] = await db
      .update(weeklyClosuresTable)
      .set(updateData)
      .where(eq(weeklyClosuresTable.id, id))
      .returning();
    return row ? mapRowToWeeklyClosure(row) : null;
  },

  async delete(id: string): Promise<boolean> {
    const [row] = await db
      .delete(weeklyClosuresTable)
      .where(eq(weeklyClosuresTable.id, id))
      .returning();
    return !!row;
  }
};
