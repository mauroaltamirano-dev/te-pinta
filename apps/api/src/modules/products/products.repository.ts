import type {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from './products.types';

const products = new Map<string, Product>();

function generateProductId() {
  return crypto.randomUUID();
}

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

export const productsRepository = {
  findAll(): Product[] {
    return Array.from(products.values());
  },

  findById(id: string): Product | null {
    return products.get(id) ?? null;
  },

  findByName(name: string): Product | null {
    const normalized = normalizeName(name);

    for (const product of products.values()) {
      if (normalizeName(product.name) === normalized) {
        return product;
      }
    }

    return null;
  },

  create(input: CreateProductInput): Product {
    const now = new Date().toISOString();

    const product: Product = {
      id: generateProductId(),
      categoryId: input.categoryId,
      name: input.name,
      description: input.description || null,
      kind: input.kind,
      unitPrice: input.unitPrice,
      halfDozenPrice: input.halfDozenPrice ?? null,
      dozenPrice: input.dozenPrice ?? null,
      directCost: input.directCost ?? null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    products.set(product.id, product);

    return product;
  },

  update(id: string, input: UpdateProductInput): Product | null {
    const existing = products.get(id);

    if (!existing) {
      return null;
    }

    const updated: Product = {
      ...existing,
      categoryId: input.categoryId ?? existing.categoryId,
      name: input.name ?? existing.name,
      description: input.description ?? existing.description,
      kind: input.kind ?? existing.kind,
      unitPrice: input.unitPrice ?? existing.unitPrice,
      halfDozenPrice: input.halfDozenPrice ?? existing.halfDozenPrice,
      dozenPrice: input.dozenPrice ?? existing.dozenPrice,
      directCost: input.directCost ?? existing.directCost,
      isActive: input.isActive ?? existing.isActive,
      updatedAt: new Date().toISOString(),
    };

    products.set(id, updated);

    return updated;
  },

  deactivate(id: string): Product | null {
    const existing = products.get(id);

    if (!existing) {
      return null;
    }

    const updated: Product = {
      ...existing,
      isActive: false,
      updatedAt: new Date().toISOString(),
    };

    products.set(id, updated);

    return updated;
  },

  reactivate(id: string): Product | null {
    const existing = products.get(id);

    if (!existing) {
      return null;
    }

    const updated: Product = {
      ...existing,
      isActive: true,
      updatedAt: new Date().toISOString(),
    };

    products.set(id, updated);

    return updated;
  },
};