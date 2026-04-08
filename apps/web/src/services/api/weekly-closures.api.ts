import { apiClient } from "./client";

export type WeeklyClosure = {
  id: string;
  name: string | null;
  startDate: string;
  endDate: string;
  status: "open" | "closed";
  notes: string | null;
  snapshot: string | null; // JSON String
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
};

export type WeeklyClosureSnapshot = {
  totalOrders: number;
  totalDeliveredOrders: number;
  confirmedOrders: number;
  preparedOrders: number;
  cancelledOrders: number;
  totalUnits: number;
  totalDozens: number;
  grossRevenue: number;
  totalDiscounts: number;
  totalPurchases: number;
  totalIngredientPurchases: number;
  totalOperationalPurchases: number;
  totalInvestmentPurchases: number;
  estimatedProfit: number;
  averageTicket: number;
  topVarieties: Array<{ name: string; quantity: number }>;
  breakdownByStatus: Record<string, number>;
  breakdownByPurchaseType: Record<string, number>;
  breakdownByChannel: Record<string, number>;
  breakdownByVariety: Record<string, number>;
};

export async function getClosures() {
  return await apiClient.get<WeeklyClosure[]>("/weekly-closures");
}

export async function getCurrentOpenClosure() {
  return await apiClient.get<WeeklyClosure | null>("/weekly-closures/open");
}

export async function getClosureById(id: string) {
  return await apiClient.get<WeeklyClosure>(`/weekly-closures/${id}`);
}

export async function getLiveMetrics(id: string) {
  return await apiClient.get<WeeklyClosureSnapshot>(`/weekly-closures/${id}/metrics`);
}

export async function createClosure(payload: { name?: string; startDate: string; endDate: string; notes?: string }) {
  return await apiClient.post<WeeklyClosure>("/weekly-closures", payload);
}

export async function closeClosure(id: string) {
  return await apiClient.post<WeeklyClosure>(`/weekly-closures/${id}/close`, {});
}

export async function deleteClosure(id: string) {
  return await apiClient.delete(`/weekly-closures/${id}`);
}
