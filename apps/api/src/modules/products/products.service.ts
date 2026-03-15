import { categoriesRepository } from '../categories/categories.repository';
import { productsRepository } from './products.repository';
import type {
  CreateProductInput,
  ProductKind,
  UpdateProductInput,
} from './products.types';

type ServiceError = {
  statusCode: number;
  message: string;
};

function createServiceError(statusCode: number, message: string): ServiceError {
  return { statusCode, message };
}

function normalizePreparedFields<T extends CreateProductInput | UpdateProductInput>(
  kind: ProductKind,
  input: T,
): T {
  if (kind === 'prepared') {
    return {
      ...input,
      directCost: undefined,
    };
  }

  return {
    ...input,
    halfDozenPrice: undefined,
    dozenPrice: undefined,
  };
}

function validateProductRules(
  kind: ProductKind,
  input: CreateProductInput | UpdateProductInput,
) {
  if (kind === 'prepared') {
    if (input.directCost !== undefined && input.directCost !== null) {
      throw createServiceError(
        400,
        'Prepared products must not have direct cost',
      );
    }

    return;
  }

  if (input.directCost === undefined || input.directCost === null) {
    throw createServiceError(
      400,
      'Direct cost is required for resale and combo products',
    );
  }

  if (
    (input.halfDozenPrice !== undefined && input.halfDozenPrice !== null) ||
    (input.dozenPrice !== undefined && input.dozenPrice !== null)
  ) {
    throw createServiceError(
      400,
      'Half dozen and dozen prices only apply to prepared products',
    );
  }
}

export const productsService = {
  getAll() {
    return productsRepository.findAll();
  },

  getById(id: string) {
    return productsRepository.findById(id);
  },

  create(input: CreateProductInput) {
    const category = categoriesRepository.findById(input.categoryId);

    if (!category) {
      throw createServiceError(400, 'Category does not exist');
    }

    const existingProduct = productsRepository.findByName(input.name);

    if (existingProduct) {
      throw createServiceError(409, 'Product name already exists');
    }

    validateProductRules(input.kind, input);

    const normalizedInput = normalizePreparedFields(input.kind, input);

    return productsRepository.create(normalizedInput);
  },

  update(id: string, input: UpdateProductInput) {
    const existing = productsRepository.findById(id);

    if (!existing) {
      return null;
    }

    if (input.categoryId) {
      const category = categoriesRepository.findById(input.categoryId);

      if (!category) {
        throw createServiceError(400, 'Category does not exist');
      }
    }

    if (input.name) {
      const sameName = productsRepository.findByName(input.name);

      if (sameName && sameName.id !== id) {
        throw createServiceError(409, 'Product name already exists');
      }
    }

    const nextKind = input.kind ?? existing.kind;
    // Strip nulls from `existing` so the merged object is compatible with
    // CreateProductInput | UpdateProductInput, which use `undefined` (not `null`)
    // for absent optional fields (Zod's .optional() produces T | undefined).
    const existingWithoutNulls = Object.fromEntries(
      Object.entries(existing).filter(([, v]) => v !== null),
    ) as UpdateProductInput;
    const mergedInput = {
      ...existingWithoutNulls,
      ...input,
    };

    validateProductRules(nextKind, mergedInput);

    const normalizedInput = normalizePreparedFields(nextKind, input);

    return productsRepository.update(id, normalizedInput);
  },

  deactivate(id: string) {
    return productsRepository.deactivate(id);
  },

  reactivate(id: string) {
    return productsRepository.reactivate(id);
  },
};