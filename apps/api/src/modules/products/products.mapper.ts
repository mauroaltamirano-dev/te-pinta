import type { Product, ProductResponse } from "./products.types";

export const productsMapper = {
  toResponse(product: Product, categoryName: string | null = null): ProductResponse {
    return {
      id: product.id,
      categoryId: product.categoryId,
      categoryName,
      name: product.name,
      description: product.description,
      kind: product.kind,
      unitPrice: product.unitPrice,
      halfDozenPrice: product.halfDozenPrice,
      dozenPrice: product.dozenPrice,
      directCost: product.directCost,
      isActive: product.isActive,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  },

  toResponseList(products: Product[]): ProductResponse[] {
    return products.map((product) => this.toResponse(product));
  },
};