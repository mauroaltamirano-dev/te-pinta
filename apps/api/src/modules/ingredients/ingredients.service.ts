import { ingredientsRepository } from './ingredients.repository';
import type {
  CreateIngredientInput,
  UpdateIngredientInput,
} from './ingredients.types';

type ServiceError = {
  statusCode: number;
  message: string;
};

function createServiceError(statusCode: number, message: string): ServiceError {
  return { statusCode, message };
}

export const ingredientsService = {
  getAll() {
    return ingredientsRepository.findAll();
  },

  getById(id: string) {
    return ingredientsRepository.findById(id);
  },

  create(input: CreateIngredientInput) {
    const existing = ingredientsRepository.findByName(input.name);

    if (existing) {
      throw createServiceError(409, 'Ingredient name already exists');
    }

    return ingredientsRepository.create(input);
  },

  update(id: string, input: UpdateIngredientInput) {
    const existing = ingredientsRepository.findById(id);

    if (!existing) {
      return null;
    }

    if (input.name) {
      const sameName = ingredientsRepository.findByName(input.name);

      if (sameName && sameName.id !== id) {
        throw createServiceError(409, 'Ingredient name already exists');
      }
    }

    return ingredientsRepository.update(id, input);
  },

  deactivate(id: string) {
    return ingredientsRepository.deactivate(id);
  },
};