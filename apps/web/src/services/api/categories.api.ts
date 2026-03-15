import { apiClient } from "./client";

export type Category = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
};

export function getCategories() {
  return apiClient.get<Category[]>("/categories");
}

export function createCategory(data: {
  name: string;
  description?: string;
}) {
  return apiClient.post<Category>("/categories", data);
}