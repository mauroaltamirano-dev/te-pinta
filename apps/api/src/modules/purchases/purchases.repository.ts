import type {
  CreatePurchaseInput,
  Purchase,
  UpdatePurchaseInput,
} from './purchases.types';

const purchases = new Map<string, Purchase>();

function generatePurchaseId() {
  return crypto.randomUUID();
}

export const purchasesRepository = {
  findAll(): Purchase[] {
    return Array.from(purchases.values());
  },

  findById(id: string): Purchase | null {
    return purchases.get(id) ?? null;
  },

  create(input: CreatePurchaseInput): Purchase {
    const now = new Date().toISOString();

    const purchase: Purchase = {
      id: generatePurchaseId(),
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
      createdAt: now,
      updatedAt: now,
    };

    purchases.set(purchase.id, purchase);

    return purchase;
  },

  update(id: string, input: UpdatePurchaseInput): Purchase | null {
    const existing = purchases.get(id);

    if (!existing) {
      return null;
    }

    const updated: Purchase = {
      ...existing,
      date: input.date ?? existing.date,
      type: input.type ?? existing.type,
      ingredientId: input.ingredientId ?? existing.ingredientId,
      nameSnapshot: input.nameSnapshot ?? existing.nameSnapshot,
      quantity: input.quantity ?? existing.quantity,
      unit: input.unit ?? existing.unit,
      unitPrice: input.unitPrice ?? existing.unitPrice,
      totalAmount: input.totalAmount ?? existing.totalAmount,
      supplier: input.supplier ?? existing.supplier,
      notes: input.notes ?? existing.notes,
      updatedAt: new Date().toISOString(),
    };

    purchases.set(id, updated);

    return updated;
  },
};