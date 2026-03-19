import { eq, ilike } from 'drizzle-orm';

import { db } from '../../db/client';
import { clientsTable } from '../../db/schema';
import type { Client, CreateClientInput, UpdateClientInput } from './clients.types';

function mapRowToClient(row: typeof clientsTable.$inferSelect): Client {
  return {
    id:        row.id,
    name:      row.name,
    phone:     row.phone,
    address:   row.address,
    notes:     row.notes,
    isActive:  row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const clientsRepository = {
  async findAll(options?: { includeInactive?: boolean }): Promise<Client[]> {
    const rows = await db.select().from(clientsTable);
    if (options?.includeInactive) return rows.map(mapRowToClient);
    return rows.filter((r) => r.isActive).map(mapRowToClient);
  },

  async findById(id: string): Promise<Client | null> {
    const [row] = await db
      .select()
      .from(clientsTable)
      .where(eq(clientsTable.id, id));
    return row ? mapRowToClient(row) : null;
  },

  async findByName(name: string): Promise<Client | null> {
    const [row] = await db
      .select()
      .from(clientsTable)
      .where(ilike(clientsTable.name, name.trim()));
    return row ? mapRowToClient(row) : null;
  },

  async create(input: CreateClientInput): Promise<Client> {
    const [row] = await db
      .insert(clientsTable)
      .values({
        name:     input.name.trim(),
        phone:    input.phone?.trim() || null,
        address:  input.address?.trim() || null,
        notes:    input.notes?.trim() || null,
        isActive: true,
      })
      .returning();
    return mapRowToClient(row);
  },

  async update(id: string, input: UpdateClientInput): Promise<Client | null> {
    const values: Partial<typeof clientsTable.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (input.name    !== undefined) values.name    = input.name.trim();
    if (input.phone   !== undefined) values.phone   = input.phone.trim() || null;
    if (input.address !== undefined) values.address = input.address.trim() || null;
    if (input.notes   !== undefined) values.notes   = input.notes.trim() || null;

    const [row] = await db
      .update(clientsTable)
      .set(values)
      .where(eq(clientsTable.id, id))
      .returning();
    return row ? mapRowToClient(row) : null;
  },

  async deactivate(id: string): Promise<Client | null> {
    const [row] = await db
      .update(clientsTable)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(clientsTable.id, id))
      .returning();
    return row ? mapRowToClient(row) : null;
  },

  async reactivate(id: string): Promise<Client | null> {
    const [row] = await db
      .update(clientsTable)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(clientsTable.id, id))
      .returning();
    return row ? mapRowToClient(row) : null;
  },
};