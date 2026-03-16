import { categoriesRepository } from "../categories/categories.repository";
import {
  productsRepository,
  type ProductWithCategory,
} from "./products.repository";
import type {
  CreateProductInput,
  UpdateProductInput,
} from "./products.types";

type ServiceError = {
  statusCode: number;
  message: string;
};

function createServiceError(statusCode: number, message: string): ServiceError {
  return { statusCode, message };
}

export const productsService = {
  async getAll(): Promise<ProductWithCategory[]> {
    return await productsRepository.findAll();
  },

  async getById(id: string): Promise<ProductWithCategory | null> {
    return await productsRepository.findById(id);
  },

  async create(input: CreateProductInput): Promise<ProductWithCategory> {
    const category = await categoriesRepository.findById(input.categoryId);

    if (!category) {
      throw createServiceError(400, "Category does not exist");
    }

    const existing = await productsRepository.findByName(input.name);

    if (existing) {
      throw createServiceError(409, "Product name already exists");
    }

    return await productsRepository.create(input);
  },

  async update(
    id: string,
    input: UpdateProductInput,
  ): Promise<ProductWithCategory | null> {
    const existing = await productsRepository.findById(id);

    if (!existing) {
      return null;
    }

    if (input.categoryId) {
      const category = await categoriesRepository.findById(input.categoryId);

      if (!category) {
        throw createServiceError(400, "Category does not exist");
      }
    }

    if (input.name) {
      const sameName = await productsRepository.findByName(input.name);

      if (sameName && sameName.id !== id) {
        throw createServiceError(409, "Product name already exists");
      }
    }

    return await productsRepository.update(id, input);
  },

  async deactivate(id: string): Promise<ProductWithCategory | null> {
    return await productsRepository.deactivate(id);
  },

  async reactivate(id: string): Promise<ProductWithCategory | null> {
    return await productsRepository.reactivate(id);
  },
};