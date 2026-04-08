import { apiClient } from "./client";

export type DashboardRange = "today" | "7d" | "30d" | "month";

export type SalesSummary = {
  grossSales: number;
  totalOrders: number;
  averageTicket: number;
  totalItemsSold: number;
};

export type SalesTrendItem = {
  date: string;
  grossSales: number;
  orders: number;
};

export type SalesByPaymentMethodItem = {
  paymentMethod: string;
  total: number;
};

export type TopProductItem = {
  productId: string;
  productName: string;
  quantitySold: number;
  totalSales: number;
};

export type RecentSaleItem = {
  id: string;
  customerName: string | null;
  total: number;
  paymentMethod: string;
  createdAt: string;
  status: string;
};

export type SalesDashboardResponse = {
  summary: SalesSummary;
  trend: SalesTrendItem[];
  byPaymentMethod: SalesByPaymentMethodItem[];
  topProducts: TopProductItem[];
  recentSales: RecentSaleItem[];
};

// ── Operational ───────────────────────────────────────────────────────────────

export type OperationalVariety = {
  productId: string;
  productName: string;
  units: number;
  dozens: number;
};

export type OperationalOrderSummary = {
  id: string;
  customerName: string | null;
  status: "confirmed" | "prepared";
  channel: string;
  deliveryDate: string | null;
  totalAmount: number;
  totalUnits: number;
};

export type OperationalDashboardResponse = {
  confirmedCount: number;
  preparedCount: number;
  totalActiveOrders: number;
  totalUnits: number;
  totalDozens: number;
  varieties: OperationalVariety[];
  activeOrders: OperationalOrderSummary[];
};

// ── API calls ─────────────────────────────────────────────────────────────────

export function getSalesDashboard(range: DashboardRange = "7d") {
  return apiClient.get<SalesDashboardResponse>("/dashboard/sales", {
    params: { range },
  });
}

export function getOperationalDashboard() {
  return apiClient.get<OperationalDashboardResponse>("/dashboard/operational");
}