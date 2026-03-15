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
  getAll() {
    return purchasesRepository.findAll();
  },

  getById(id: string) {
    return purchasesRepository.findById(id);
  },

  create(input: CreatePurchaseInput) {
    if (input.type === 'ingredient') {
      const ingredient = input.ingredientId
        ? ingredientsRepository.findById(input.ingredientId)
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

      if (input.unitPrice !== undefined) {
        ingredientsRepository.update(ingredient.id, {
          currentCost: input.unitPrice,
        });
      }
    }

    return purchasesRepository.create(input);
  },

  update(id: string, input: UpdatePurchaseInput) {
    const existing = purchasesRepository.findById(id);

    if (!existing) {
      return null;
    }

    return purchasesRepository.update(id, input);
  },

  getSummary() {
  const purchases = purchasesRepository.findAll();

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