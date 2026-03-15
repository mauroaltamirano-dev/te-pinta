import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from './categories.types';

const categories = new Map<string, Category>();

function generateCategoryId() {
  return crypto.randomUUID();
}

function normalizeCategoryName(name: string) {
  return name.trim().toLowerCase();
}

export const categoriesRepository = {
  findAll(): Category[] {
    return Array.from(categories.values());
  },

  findById(id: string): Category | null {
    return categories.get(id) ?? null;
  },

  findByName(name: string): Category | null {
    const normalizedName = normalizeCategoryName(name);

    for (const category of categories.values()) {
      if (normalizeCategoryName(category.name) === normalizedName) {
        return category;
      }
    }

    return null;
  },

  create(input: CreateCategoryInput): Category {
    const now = new Date().toISOString();

    const category: Category = {
      id: generateCategoryId(),
      name: input.name,
      description: input.description || null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    categories.set(category.id, category);

    return category;
  },

  update(id: string, input: UpdateCategoryInput): Category | null {
    const existingCategory = categories.get(id);

    if (!existingCategory) {
      return null;
    }

    const updatedCategory: Category = {
      ...existingCategory,
      name: input.name ?? existingCategory.name,
      description:
        input.description ?? existingCategory.description,
      updatedAt: new Date().toISOString(),
    };

    categories.set(id, updatedCategory);

    return updatedCategory;
  },

  deactivate(id: string): Category | null {
    const existingCategory = categories.get(id);

    if (!existingCategory) {
      return null;
    }

    const updatedCategory: Category = {
      ...existingCategory,
      isActive: false,
      updatedAt: new Date().toISOString(),
    };

    categories.set(id, updatedCategory);

    return updatedCategory;
  },
};