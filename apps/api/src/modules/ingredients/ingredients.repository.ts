import type {
  Ingredient,
  CreateIngredientInput,
  UpdateIngredientInput,
} from './ingredients.types';

const ingredients = new Map<string, Ingredient>();

function generateIngredientId() {
  return crypto.randomUUID();
}

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

export const ingredientsRepository = {
  findAll(): Ingredient[] {
    return Array.from(ingredients.values());
  },

  findById(id: string): Ingredient | null {
    return ingredients.get(id) ?? null;
  },

  findByName(name: string): Ingredient | null {
    const normalized = normalizeName(name);

    for (const ingredient of ingredients.values()) {
      if (normalizeName(ingredient.name) === normalized) {
        return ingredient;
      }
    }

    return null;
  },

  create(input: CreateIngredientInput): Ingredient {
    const now = new Date().toISOString();

    const ingredient: Ingredient = {
      id: generateIngredientId(),
      name: input.name,
      description: input.description || null,
      unit: input.unit,
      currentCost: input.currentCost,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    ingredients.set(ingredient.id, ingredient);

    return ingredient;
  },

  update(id: string, input: UpdateIngredientInput): Ingredient | null {
    const existing = ingredients.get(id);

    if (!existing) {
      return null;
    }

    const updated: Ingredient = {
      ...existing,
      name: input.name ?? existing.name,
      description: input.description ?? existing.description,
      unit: input.unit ?? existing.unit,
      currentCost: input.currentCost ?? existing.currentCost,
      updatedAt: new Date().toISOString(),
    };

    ingredients.set(id, updated);

    return updated;
  },

  deactivate(id: string): Ingredient | null {
    const existing = ingredients.get(id);

    if (!existing) {
      return null;
    }

    const updated: Ingredient = {
      ...existing,
      isActive: false,
      updatedAt: new Date().toISOString(),
    };

    ingredients.set(id, updated);

    return updated;
  },
};