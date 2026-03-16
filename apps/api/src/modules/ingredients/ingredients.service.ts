import { ingredientsRepository } from "./ingredients.repository";
import type {
  CreateIngredientInput,
  UpdateIngredientInput,
} from "./ingredients.types";

type ServiceError = {
  statusCode: number;
  message: string;
};

function createServiceError(statusCode: number, message: string): ServiceError {
  return { statusCode, message };
}

export const ingredientsService = {
  async getAll() {
    return await ingredientsRepository.findAll();
  },

  async getById(id: string) {
    return await ingredientsRepository.findById(id);
  },

  async create(input: CreateIngredientInput) {
    const existing = await ingredientsRepository.findByName(input.name);

    if (existing) {
      throw createServiceError(409, "Ingredient name already exists");
    }

    return await ingredientsRepository.create(input);
  },

  async update(id: string, input: UpdateIngredientInput) {
    const existing = await ingredientsRepository.findById(id);

    if (!existing) {
      return null;
    }

    if (input.name) {
      const sameName = await ingredientsRepository.findByName(input.name);

      if (sameName && sameName.id !== id) {
        throw createServiceError(409, "Ingredient name already exists");
      }
    }

    return await ingredientsRepository.update(id, input);
  },

  async deactivate(id: string) {
    return await ingredientsRepository.deactivate(id);
  },
};