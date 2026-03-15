import type { Category } from './categories.types';

export const categoriesMapper = {
  toResponse(category: Category) {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  },

  toResponseList(categories: Category[]) {
    return categories.map((category) => this.toResponse(category));
  },
};