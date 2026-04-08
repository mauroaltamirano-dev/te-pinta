import { z } from "zod";

export type WeeklyClosure = {
  id: string;
  name: string | null;
  startDate: Date | string;
  endDate: Date | string;
  status: "open" | "closed";
  notes: string | null;
  snapshot: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  closedAt: Date | string | null;
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

export type CreateWeeklyClosureInput = {
  name?: string;
  startDate: string;
  endDate: string;
  notes?: string;
};

export type CloseWeeklyClosureInput = {
  id: string;
};
