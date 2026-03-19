import { apiClient } from "./client";

export type Category = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
};

export function getCategories(options?: { includeInactive?: boolean }) {
  return apiClient.get<Category[]>("/categories", {
    params: {
      includeInactive: options?.includeInactive,
    },
  });
}

export function createCategory(data: {
  name: string;
  description?: string;
}) {
  return apiClient.post<Category>("/categories", data);
}

export function updateCategory(
  id: string,
  data: {
    name?: string;
    description?: string;
  },
) {
  return apiClient.patch<Category>(`/categories/${id}`, data);
}

export function deactivateCategory(id: string) {
  return apiClient.delete(`/categories/${id}`);
}

export function reactivateCategory(id: string) {
  return apiClient.patch<Category>(`/categories/${id}/reactivate`, {});
}