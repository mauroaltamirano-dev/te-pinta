export type DashboardRange = 'today' | '7d' | '30d' | 'month';

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