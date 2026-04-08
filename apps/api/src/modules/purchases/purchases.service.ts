import { ingredientsRepository } from '../ingredients/ingredients.repository';
import { purchasesRepository } from './purchases.repository';
import type {
  CreatePurchaseInput,
  UpdatePurchaseInput,
} from './purchases.types';

type ServiceError = {
  statusCode: number;
  message: string;
};

function createServiceError(statusCode: number, message: string): ServiceError {
  return { statusCode, message };
}

export const purchasesService = {
  async getAll() {
    return purchasesRepository.findAll();
  },

  async getById(id: string) {
    return purchasesRepository.findById(id);
  },

  async create(input: CreatePurchaseInput) {
    if (input.type === 'ingredient') {
      const ingredient = input.ingredientId
        ? await ingredientsRepository.findById(input.ingredientId)
        : null;

      if (!ingredient) {
        throw createServiceError(400, 'Ingredient does not exist');
      }

      if (input.unit && ingredient.unit !== input.unit) {
        throw createServiceError(
          400,
          `Purchase unit "${input.unit}" does not match ingredient unit "${ingredient.unit}"`,
        );
      }

      if (input.unitPrice !== undefined && input.unitPrice !== null) {
        await ingredientsRepository.update(ingredient.id, {
          currentCost: input.unitPrice,
        });
      }
    }

    return purchasesRepository.create(input);
  },

  async update(id: string, input: UpdatePurchaseInput) {
    const existing = await purchasesRepository.findById(id);

    if (!existing) {
      return null;
    }

    if (input.type === 'ingredient' || (existing.type === 'ingredient' && !input.type)) {
      const unitPrice = input.unitPrice !== undefined ? input.unitPrice : existing.unitPrice;
      const ingredientId = input.ingredientId !== undefined ? input.ingredientId : existing.ingredientId;
      
      if (unitPrice !== null && ingredientId) {
        await ingredientsRepository.update(ingredientId, {
          currentCost: unitPrice,
        });
      }
    }

    return purchasesRepository.update(id, input);
  },

  async remove(id: string) {
    return purchasesRepository.delete(id);
  },

  async getSummary() {
    const purchases = await purchasesRepository.findAll();

    const summary = purchases.reduce(
      (acc, purchase) => {
        acc.totalAmount += purchase.totalAmount;
        acc.count += 1;

        if (purchase.type === 'ingredient') {
          acc.ingredientTotal += purchase.totalAmount;
        }

        if (purchase.type === 'operational') {
          acc.operationalTotal += purchase.totalAmount;
        }

        if (purchase.type === 'investment') {
          acc.investmentTotal += purchase.totalAmount;
        }

        return acc;
      },
      {
        totalAmount: 0,
        ingredientTotal: 0,
        operationalTotal: 0,
        investmentTotal: 0,
        count: 0,
      },
    );

    return summary;
  },  
};