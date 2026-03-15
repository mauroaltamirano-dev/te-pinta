import { apiClient } from "./client";

export type PurchaseType = "ingredient" | "operational" | "investment";
export type PurchaseUnit = "kg" | "g" | "l" | "ml" | "unit";

export type Purchase = {
  id: string;
  date: string;
  type: PurchaseType;
  ingredientId: string | null;
  nameSnapshot: string;
  quantity: number | null;
  unit: PurchaseUnit | null;
  unitPrice: number | null;
  totalAmount: number;
  supplier: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export function getPurchases() {
  return apiClient.get<Purchase[]>("/purchases");
}

export function createPurchase(data: {
  date: string;
  type: PurchaseType;
  ingredientId?: string;
  nameSnapshot: string;
  quantity?: number;
  unit?: PurchaseUnit;
  unitPrice?: number;
  totalAmount: number;
  supplier?: string;
  notes?: string;
}) {
  return apiClient.post<Purchase>("/purchases", data);
}

export type PurchasesSummary = {
  totalAmount: number;
  ingredientTotal: number;
  operationalTotal: number;
  investmentTotal: number;
  count: number;
};

export function getPurchasesSummary() {
  return apiClient.get<PurchasesSummary>("/purchases-summary");
}