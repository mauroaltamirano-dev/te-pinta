import { categoriesRepository } from "./categories.repository";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./categories.types";

type ServiceError = {
  statusCode: number;
  message: string;
};

function createServiceError(statusCode: number, message: string): ServiceError {
  return { statusCode, message };
}

export const categoriesService = {
  async getAll() {
    return await categoriesRepository.findAll();
  },

  async getById(id: string) {
    return await categoriesRepository.findById(id);
  },

  async create(input: CreateCategoryInput) {
    const existingCategory = await categoriesRepository.findByName(input.name);

    if (existingCategory) {
      throw createServiceError(409, "Category name already exists");
    }

    return await categoriesRepository.create(input);
  },

  async update(id: string, input: UpdateCategoryInput) {
    const existingCategory = await categoriesRepository.findById(id);

    if (!existingCategory) {
      return null;
    }

    if (input.name) {
      const categoryWithSameName = await categoriesRepository.findByName(
        input.name,
      );

      if (categoryWithSameName && categoryWithSameName.id !== id) {
        throw createServiceError(409, "Category name already exists");
      }
    }

    return await categoriesRepository.update(id, input);
  },

  async deactivate(id: string) {
    return await categoriesRepository.deactivate(id);
  },
};