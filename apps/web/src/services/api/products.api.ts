import { apiClient } from "./client";

export type ProductKind = "prepared" | "resale" | "combo";

export type Product = {
  id: string;
  categoryId: string;
  categoryName: string | null;
  name: string;
  description: string | null;
  kind: ProductKind;
  unitPrice: number;
  halfDozenPrice: number | null;
  dozenPrice: number | null;
  directCost: number | null;
  isActive: boolean;
};

export type CreateProductPayload = {
  categoryId: string;
  name: string;
  description?: string;
  kind: ProductKind;
  unitPrice: number;
  halfDozenPrice?: number;
  dozenPrice?: number;
  directCost?: number;
};

export type UpdateProductPayload = Partial<CreateProductPayload>;

export function getProducts(options?: { includeInactive?: boolean }) {
  return apiClient.get<Product[]>("/products", {
    params: {
      includeInactive: options?.includeInactive,
    },
  });
}
export function createProduct(data: CreateProductPayload) {
  return apiClient.post<Product>("/products", data);
}

export function updateProduct(productId: string, data: UpdateProductPayload) {
  return apiClient.patch<Product>(`/products/${productId}`, data);
}

export function deactivateProduct(productId: string) {
  return apiClient.delete<Product>(`/products/${productId}`);
}

export function reactivateProduct(productId: string) {
  return apiClient.patch<Product>(`/products/${productId}/reactivate`, {});
}