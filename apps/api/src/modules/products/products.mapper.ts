import { categoriesRepository } from '../categories/categories.repository';
import type { Product, ProductResponse } from './products.types';

function resolveCategoryName(categoryId: string) {
  return categoriesRepository.findById(categoryId)?.name ?? null;
}

export const productsMapper = {
  toResponse(product: Product): ProductResponse {
    return {
      id: product.id,
      categoryId: product.categoryId,
      categoryName: resolveCategoryName(product.categoryId),
      name: product.name,
      description: product.description,
      kind: product.kind,
      unitPrice: product.unitPrice,
      halfDozenPrice: product.halfDozenPrice,
      dozenPrice: product.dozenPrice,
      directCost: product.directCost,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  },

  toResponseList(products: Product[]) {
    return products.map((product) => this.toResponse(product));
  },
};