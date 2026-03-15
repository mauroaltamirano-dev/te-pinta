import { categoriesRepository } from './categories.repository';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from './categories.types';

type ServiceError = {
  statusCode: number;
  message: string;
};

function createServiceError(statusCode: number, message: string): ServiceError {
  return { statusCode, message };
}

export const categoriesService = {
  getAll() {
    return categoriesRepository.findAll();
  },

  getById(id: string) {
    return categoriesRepository.findById(id);
  },

  create(input: CreateCategoryInput) {
    const existingCategory = categoriesRepository.findByName(input.name);

    if (existingCategory) {
      throw createServiceError(409, 'Category name already exists');
    }

    return categoriesRepository.create(input);
  },

  update(id: string, input: UpdateCategoryInput) {
    const existingCategory = categoriesRepository.findById(id);

    if (!existingCategory) {
      return null;
    }

    if (input.name) {
      const categoryWithSameName = categoriesRepository.findByName(input.name);

      if (categoryWithSameName && categoryWithSameName.id !== id) {
        throw createServiceError(409, 'Category name already exists');
      }
    }

    return categoriesRepository.update(id, input);
  },

  deactivate(id: string) {
    return categoriesRepository.deactivate(id);
  },
};